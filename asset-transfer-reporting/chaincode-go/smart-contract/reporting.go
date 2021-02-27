package reporting

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing an report
type SmartContract struct {
	contractapi.Contract
}

// Report describes basic details of what makes up a simple report
type Report struct {
	ID           string `json:"id"`
	IssuedDate   string `json:"issuedDate"`
	DoctorName   string `json:"doctorName"`
	PatientName  string `json:"patientName"`
	HospitalName string `json:"hospitalName"`
	Timestamp    string `json:"timestamp"`
	Description  string `json:"description"`
	Height       string `json:"height"`
	Weight       string `json:"weight"`
}

// InitLedger adds a base set of reports to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	// reports := []Report{
	// 	{ID: "invoice1", DoctorName: "Bibek", PatientName: "Dipesh", HospitalName: "patan", Timestamp: "23-12-2020", Description: ""},
	// 	{ID: "invoice2", DoctorName: "Ram", PatientName: "Shyam", HospitalName: "telganga", Timestamp: "23-12-2020", Description: ""},
	// }

	// for _, report := range reports {
	// 	reportJSON, err := json.Marshal(report)
	// 	if err != nil {
	// 		return err
	// 	}

	// 	err = ctx.GetStub().PutState(report.ID, reportJSON)
	// 	if err != nil {
	// 		return fmt.Errorf("failed to put to world state. %v", err)
	// 	}
	// }

	return nil
}

// CreateReport issues a new report to the world state with given details.
func (s *SmartContract) CreateReport(ctx contractapi.TransactionContextInterface, id string,/*issuedDate string*/ doctorName string, patientName string, hospitalName string, description string, at string, height string, weight string) error {
	exists, err := s.ReportExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the report %s already exists", id)
	}

	report := Report{

		ID:           id,
		//IssuedDate:   issuedDate,
		DoctorName:   doctorName,
		PatientName:  patientName,
		HospitalName: hospitalName,
		Timestamp:    at,
		Description:  description,
		Height:       height,
		Weight:       weight,
	}

	reportJSON, err := json.Marshal(report)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, reportJSON)
}

// ReadReport returns the report stored in the world state with given ID.
func (s *SmartContract) ReadReport(ctx contractapi.TransactionContextInterface, id  string) (*Report, error) {
	reportJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to readDoctorName world state: %v", err)
	}
	if reportJSON == nil {
		return nil, fmt.Errorf("the report %s does not exist", id)
	}

	var report Report
	err = json.Unmarshal(reportJSON, &report)
	if err != nil {
		return nil, err
	}

	return &report, nil
}

// ReadReportFromUser returns the report stored in the world state sent by users.
func (s *SmartContract) ReadReportFromUser(ctx contractapi.TransactionContextInterface, PatientName string) ([]*Report, error) {
	queryString := fmt.Sprintf("{\"selector\":{\"patientName\":\"%s\"}}", PatientName)

	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var reports []*Report
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var report Report
		err = json.Unmarshal(queryResponse.Value, &report)
		if err != nil {
			return nil, err
		}
		reports = append(reports, &report)
	}

	return reports, nil
}

// UpdateReport updates an existing report in the world state with provided parameters.
func (s *SmartContract) UpdateReport(ctx contractapi.TransactionContextInterface, id string/*issuedDate string*/, doctorName string, patientName string, hospitalName string, description string, at string, height string, weight string) error {
	exists, err := s.ReportExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the report %s does not exist", id)
	}

	// overwriting original report with new report
	report := Report{

		ID:           id,
		//IssuedDate:   issuedDate,
		DoctorName:   doctorName,
		PatientName:  patientName,
		HospitalName: hospitalName,
		Timestamp:    at,
		Description:  description,
		Height:       height,
		Weight:       weight,
	}
	reportJSON, err := json.Marshal(report)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, reportJSON)
}

// DeleteReport deletes an given reportDoctorName the world state.
func (s *SmartContract) DeleteReport(ctx contractapi.TransactionContextInterface, id string) error {
	exists, err := s.ReportExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the report %s does not exist", id)
	}

	return ctx.GetStub().DelState(id)
}

// ReportExists returns true when report with given ID exists in world state
func (s *SmartContract) ReportExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	reportJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to readDoctorName world state: %v", err)
	}

	return reportJSON != nil, nil
}

// GetAllReports returns all reports found in world state
func (s *SmartContract) GetAllReports(ctx contractapi.TransactionContextInterface) ([]*Report, error) {
	// range query with empty string for startKey and endKey does an
	// open-ended query of all reports in the chaincode namespace.
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var reports []*Report
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var report Report
		err = json.Unmarshal(queryResponse.Value, &report)
		if err != nil {
			return nil, err
		}
		reports = append(reports, &report)
	}

	return reports, nil
}
