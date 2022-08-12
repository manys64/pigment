import React from "react";
import { DateHelper } from "./DateHelper";
import {CSSProperties} from "../../../WebStorm/plugins/JavaScriptLanguage/jsLanguageServicesImpl/external/react";

export interface BatchesInterface {
    id: number;
    birthPeriodStart: Date;
    birthPeriodEnd: Date | null;
    saleDate: Date | null;
}
type BatchesForm = {
    id: number | null;
    birthPeriodStart: Date | null;
    birthPeriodEnd: Date | null;
    saleDate: Date | null;
    error: boolean;
}

type BatchesState = {
    data: Array<BatchesInterface>;
    formData: BatchesForm;
    deleted: boolean;
}

export class Batches extends React.Component<any, BatchesState>{

    state : BatchesState = {
        data: Array<BatchesInterface>(),
        formData: {
            id: null,
            birthPeriodEnd: null,
            birthPeriodStart: null,
            saleDate: null,
            error: false
        },
        deleted: false
    }

    constructor(props: any) {
        super(props);
        this.sendData = this.sendData.bind(this);
        this.changeHandle = this.changeHandle.bind(this);
        this.removeDeleted = this.removeDeleted.bind(this);
        this.updateTable();
    }

    updateTable() {
        fetch('http://localhost:8080/productionBatches', {
            "cache": "no-cache"
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error occurs while fetching data");
                }
                return response.json();
            })
            .then((data) => {
                this.setState((prevState) => ({
                    ...prevState,
                    data: data,
                    formData: {
                        id: null,
                        error: false,
                        saleDate: null,
                        birthPeriodStart: null,
                        birthPeriodEnd: null
                    }
                }))
            });
    }

    handleEdit(id: number | null) {
        if (!id) {
            return
        }
        fetch(`http://localhost:8080/productionBatches/${id}`, {
            "cache": "no-cache",
            method: "GET",
        })
            .then((response) => {
                if (!response.ok) {
                    throw Error("Error occurs while fetching data.")
                }
                return response.json();
            })
            .then((data: BatchesInterface) => {
                if(!data) {
                    return
                }
                this.setState((prevState) => ({
                    ...prevState,
                    formData: {
                        id: data.id,
                        birthPeriodEnd: data.birthPeriodEnd ? new Date(data.birthPeriodEnd) : null,
                        birthPeriodStart: new Date(data.birthPeriodStart),
                        saleDate: data.saleDate ? new Date(data.saleDate):  null,
                        error: false
                    }
                }))
            });
    }

    handleDelete(id: number | null) {
        if (!id) {
            return
        }
        fetch(`http://localhost:8080/productionBatches/${id}`, {
            "cache": "no-cache",
            method: "DELETE",
        })
            .then((response) => {
                if (!response.ok) {
                    alert("Błąd podczas usuwania")
                    return;
                }
                return response.text();
            })
            .then((data) => {
                if(!data) {
                    return
                }
                this.updateTable();
                this.setState((prevState) => ({
                    ...prevState,
                    deleted: true
                }))
            });
    }

    removeDeleted() {
        this.setState((prevState) => ({
            ...prevState,
            deleted: false
        }))
    }

    changeHandle(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        console.log(value)
        switch (event.target.id) {
            case "birthPeriodStart":
                this.setState((prevState) => ({
                    ...prevState,
                    formData: {
                        ...prevState.formData,
                        birthPeriodStart: value ? new Date(value) : null
                    }
                }))
                break;
            case "saleDate":
                this.setState((prevState) => ({
                    ...prevState,
                    formData: {
                        ...prevState.formData,
                        saleDate: value ? new Date(value) : null
                    }
                }))
                break;
        }
    }

    sendData(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        if (this.state.formData.birthPeriodStart) {
            let url : string;
            let method : string;
            if (this.state.formData.id){
                url = `http://localhost:8080/productionBatches/${this.state.formData.id}`
                method = 'PUT';
            } else {
                url = `http://localhost:8080/productionBatches`
                method = 'POST';
            }
            const sendData = {
                birthPeriodStart: this.state.formData.birthPeriodStart,
                saleDate: this.state.formData.saleDate,
            };
            fetch(url, {
                "cache": "no-cache",
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sendData)
            })
                .then((response) => {
                    if (!response.ok) {
                        this.setState((prevState) => ({
                            ...prevState,
                            formData: {
                                ...prevState.formData,
                                error: true
                            }
                        }))
                        return;
                    }
                    return response.json();
                })
                .then((data) => {
                    if (!data) {
                        return
                    }
                    this.updateTable();
                    document.getElementById("closeAddBatchesModal")?.click();
                });
        }
    }

    print(event: React.MouseEvent<HTMLButtonElement>) {
        const tableToPrint = (event.target as HTMLElement).parentElement?.parentElement?.parentElement?.getElementsByTagName("table")[0];
        const printHolder = window.open();
        printHolder?.document.write('<link href="css/sb-admin-2.min.css" rel="stylesheet">');
        printHolder?.document.write(tableToPrint?.outerHTML ?? "");
        setTimeout(() => {
            printHolder?.print();
            printHolder?.close();
        }, 5)
    }

    render() {
        return (
            <>
                {this.state.deleted ?
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        Usunęto grupę wiekową
                        <button onClick={this.removeDeleted} type="button" className="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div> : ""
                }
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h3 mb-0 text-gray-800">Grupy produkcyjne</h1>
                </div>
                <div className="row">
                    <div className="col-xl-12 col-lg-12">
                        <div className="card shadow mb-4">
                            <div
                                className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 className="m-0 font-weight-bold text-primary">Grupy produkcyjne</h6>
                                <div>
                                    <button onClick={this.print} className="btn btn-secondary mr-1">Drukuj stan</button>
                                    <button data-toggle="modal" data-target="#batchesModal"
                                            className="btn btn-success">Dodaj
                                    </button>
                                </div>

                            </div>
                            <div className="card-body">
                                <table className="table table-bordered">
                                    <thead>
                                    <tr>
                                        <th>Nr identyfikayjny</th>
                                        <th>Data narodzin</th>
                                        <th>Data sprzedarzy/Tydzień życia</th>
                                        <th className="d-print-none">Narzędzia</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.data.map((batch, key) =>
                                            <tr key={key}>
                                                <td>{batch.id}</td>
                                                <td>{(new Date(batch.birthPeriodStart)).toLocaleDateString()}</td>
                                                <td>{
                                                    batch.saleDate ? (new Date(batch.saleDate)).toLocaleDateString()
                                                    : `${DateHelper.weeksBetween(new Date(batch.birthPeriodStart), new Date())} tydzeń życia`
                                                }</td>
                                                <td className="d-print-none">
                                                    <span onClick={() => this.handleDelete(batch.id)}
                                                          className="table-tool table-tool-delete">Usuń</span>&nbsp;
                                                    | <span onClick={() => this.handleEdit(batch.id)}
                                                            data-toggle="modal" data-target="#batchesModal"
                                                            className="table-tool table-tool-edit">Edytuj</span>
                                                </td>
                                            </tr>)
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                    </div>
                </div>
                <div className="modal fade" id="batchesModal" role="dialog"
                     aria-labelledby="exampleModalLabel"
                     aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Dodaj</h5>
                                <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {this.state.formData.error
                                    ? <div className="invalid-feedback d-block">Wprowadzono nieprawidłowe dane</div>
                                    : ""
                                }
                                <form>
                                    <label htmlFor="birthPeriodStart">Data nardzin</label>
                                    <div className="form-group">
                                        <input className="form-control"
                                               id="birthPeriodStart"
                                               type="date"
                                               placeholder="Wprowadź datę narodzin"
                                               value={this.state.formData.birthPeriodStart?.toISOString().substring(0,10) ?? ""}
                                               onChange={((event) => this.changeHandle(event))}
                                        />
                                    </div>
                                    <label htmlFor="saleDate">Data sprzedarzy</label>
                                    <div className="form-group">
                                        <input className="form-control"
                                               id="saleDate"
                                               type={"date"}
                                               placeholder="Wprowadź datę sprzedarzy"
                                               value={this.state.formData.saleDate?.toISOString().substring(0,10) ?? ""}
                                               onChange={event => this.changeHandle(event)}
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="modal-footer">
                                <button id="closeAddBatchesModal" className="btn btn-secondary" type="button" data-dismiss="modal">Anuluj</button>
                                <button className="btn btn-primary" onClick={this.sendData}>Dodaj</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}