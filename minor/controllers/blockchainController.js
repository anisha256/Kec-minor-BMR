'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const walletPath = path.join(__dirname, '..', 'wallet');

const User = require('../models/User');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var { v4: uuidv4 } = require('uuid');

/**
 *
 * @param {*} FabricCAServices
 * @param {*} ccp
 */
const buildCAClient = (FabricCAServices, ccp, caHostName) => {
    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities[caHostName]; //lookup CA details from config
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    console.log("caInfo.url",caInfo.url)
    console.log("caName",caInfo.caName)
    console.log("caT",caTLSCACerts)
    const caClient = new FabricCAServices(`https://ca_${process.env.ORGANIZATION}:${process.env.CAPORT}`, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    console.log(`Built a CA Client named ${caInfo.caName}`);
    return caClient;
};

const buildCCP = () => {
    // load the common connection configuration file
    const ccpPath = path.resolve(__dirname, '..', '..', 'hosp-network', 'organizations', 'peerOrganizations', `${process.env.ORGANIZATION}.example.com`, `connection-${process.env.ORGANIZATION}.json`);
    console.log("ccppath",ccpPath)
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const contents = fs.readFileSync(ccpPath, 'utf8');

    // build a JSON object from the file contents
    const ccp = JSON.parse(contents);
    console.log("cpp",ccp)

    console.log(`Loaded the network configuration located at ${ccpPath}`);
    return ccp;
};

function prettyJSONString(inputString) {
    return JSON.parse(inputString);
}


const buildWallet = async (Wallets, walletPath) => {
    // Create a new  wallet : Note that wallet is for managing identities.
    let wallet;
    if (walletPath) {
        wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Built a file system wallet at ${walletPath}`);
    } else {
        wallet = await Wallets.newInMemoryWallet();
        console.log('Built an in memory wallet');
    }

    return wallet;
};

const enrollAdmin = async () => {
    try {
        const ccp = buildCCP();
        const caClient = buildCAClient(FabricCAServices, ccp, `ca_${process.env.ORGANIZATION}`);
        const wallet = await buildWallet(Wallets, walletPath);
        const identity = await wallet.get(process.env.ADMIN_USERID);
        if (identity) {
            console.log('An identity for the admin user already exists in the wallet');
            throw new Error('An identity for the admin user already exists in the wallet');
        }
        console.log("process.env.ADMIN_USERID1",process.env.ADMIN_USERID)
        console.log("process.env.ADMIN_USERPW",process.env.ADMIN_USERPW)

        const enrollment = await caClient.enroll({ enrollmentID: process.env.ADMIN_USERID, enrollmentSecret: process.env.ADMIN_USERPW });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: process.env.MSPID,
            type: 'X.509',
        };
      
        await wallet.put(process.env.ADMIN_USERID, x509Identity);
       
      } catch (error) {
        console.error(`Failed to enroll admin user : ${error}`);
        throw new Error(`Failed to enroll admin user : ${error}`);
    }
};

const registerAndEnrollUser = async (req, _res, next) => {
    try {
        console.log("body",JSON.stringify(req.body))

        const { email } = req.body;

        const ccp = buildCCP();
        const caClient = buildCAClient(FabricCAServices, ccp, `ca_${process.env.ORGANIZATION}`);
        const wallet = await buildWallet(Wallets, walletPath);

        const userIdentity = await wallet.get(email);
        if (userIdentity) {
            throw new Error(`An identity for the user ${email} already exists in the wallet`);
        }

        const adminIdentity = await wallet.get(process.env.ADMIN_USERID);
        if (!adminIdentity) {
            console.log('An identity for the admin user does not exist in the wallet');
            console.log('Enroll the admin user before retrying');

            throw new Error('An identity for the admin user does not exist in the wallet. Enroll the admin user before retrying')
        }
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, process.env.ADMIN_USERID);
  
        const secret = await caClient.register({
            affiliation: process.env.AFFILIATION,
            enrollmentID: email,
            role: 'client'
        }, adminUser);
        const enrollment = await caClient.enroll({
            enrollmentID: email,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: process.env.MSPID,
            type: 'X.509',
        };
        
        await wallet.put(email, x509Identity);
        req.ca = x509Identity;
        const user = new User({
            
            email: req.body.email,
            role: req.body.role,
            password: bcrypt.hashSync(req.body.password, 8)
            
          });
          user
          .save()
          .then(result => {
            console.log(result);
            res.status(201).json({
              message:'User created'
            })
          })
          .catch(err =>{
            console.log(err);
          })
        return next();
        

    } catch (error) {
        console.error(`Failed to register user : ${error}`);
        next(error);
    }
  
};

const invokeChaincode = async (req, _res, next) => {
    try {
        
        const funcName = req.blockchainFunc;
        const ccp = buildCCP();
        const wallet = await buildWallet(Wallets, walletPath);
        const gateway = new Gateway();
        console.log(req.header.user)
        try {
            await gateway.connect(ccp, {
                wallet,
                identity: 'admin',
                discovery: { enabled: true, asLocalhost: false }
            });
           
            
            const network = await gateway.getNetwork(process.env.CHANNEL_NAME);
            const contract = network.getContract(process.env.CHAINCODE_NAME);
            req.body._id = uuidv4();

            await contract.submitTransaction('CreateReport',
            req.body._id,
            req.body.doctorName,
            req.body.patientName,
            process.env.MSPID,
            req.body.description,
            
            Date.now(),
            req.body.height,
            req.body.patCitizenshipNo);
            // const result = await contract.evaluateTransaction(funcName, req.login._id);
            // req.blockchain = prettyJSONString(result.toString());

            return next();
        } finally {
            gateway.disconnect();
            
        }
    } catch (error) {
        next(error);
    }
}

const queryChaincode = async (req, _res, next) => {
    try {
        const funcName = req.blockchainFunc;
        const ccp = buildCCP();
        const wallet = await buildWallet(Wallets, walletPath);
        const gateway = new Gateway();
        let result;
        try {
            await gateway.connect(ccp, {
                wallet,
                identity: 'admin',
                discovery: { enabled: true, asLocalhost: false }
            });
            const network = await gateway.getNetwork(process.env.CHANNEL_NAME);
            const contract = network.getContract(process.env.CHAINCODE_NAME);

            console.log('\n--> Evaluate Transaction: ReadReport, function returns a report with a given ID');
            if (req.body.id) result = await contract.evaluateTransaction(funcName, req.body.id);
            else result = await contract.evaluateTransaction(funcName);

            console.log(`*** Result: ${prettyJSONString(result.toString())}`);

            result = prettyJSONString(result.toString());
            console.log(result)
            _res.render('report',{result})
        } finally {
            // Disconnect from the gateway when the application is closing
            // This will close all connections to the network
            gateway.disconnect();
        }
        return next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    buildCAClient,
    enrollAdmin,
    registerAndEnrollUser,
    invokeChaincode,
    queryChaincode
}