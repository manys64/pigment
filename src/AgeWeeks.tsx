import React from "react";
import {Treatments} from "./Treatment";
import Select, {MultiValue} from "react-select";
import "bootstrap"

interface AgeWeeksInterface {
    id: number | null;
    weekOfLive: number | null;
    treatments: Array<Treatments>;
}

type AgeWeeksForm = {
    id: number | null;
    weekOfLive: number | null;
    treatments: Array<{ id: number }>;
    error: boolean;
}

type AgeWeeksState = {
    data: Array<AgeWeeksInterface>;
    formData: AgeWeeksForm;
    allTreatments: Array<{ label: string; value: number; }>;
    deleted: boolean;
}

type TreatmentsNew = {
    treatments: Array<{
        id: number
    }>,
    weekOfLive: number
}

export class AgeWeeks extends React.Component<any, AgeWeeksState> {
    state: AgeWeeksState = {
        data: Array<AgeWeeksInterface>(),
        formData: {
            id: null,
            weekOfLive: null,
            treatments: Array<{ id: number }>(),
            error: false
        },
        allTreatments: [],
        deleted: false
    }

    constructor(props: any) {
        super(props);
        $("#addWeekGroup").modal('hide');
        this.sendData = this.sendData.bind(this);
        this.changeHandle = this.changeHandle.bind(this);
        this.removeDeleted = this.removeDeleted.bind(this);
        this.updateTable();

        fetch('http://localhost:8080/treatments', {
            "cache": "no-cache"
        })
            .then((response) => {
                if (!response.ok) {
                    throw Error("Fetch data error");
                }
                return response.json();
            })
            .then((data: Array<Treatments>) => {
                let allTreatments: { label: string; value: number; }[] = []
                for (const treatment of data) {
                    allTreatments.push({label: treatment.name, value: treatment.id})
                }
                this.setState((prevState) => ({
                    ...prevState,
                    allTreatments: allTreatments
                }))
            });
    }

    updateTable() {
        fetch('http://localhost:8080/ageWeeks', {
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
                    data: data
                }))
            });
    }

    sendData(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        if (this.state.formData.weekOfLive) {
            let url : string;
            let method : string;
            if (this.state.formData.id){
                url = `http://localhost:8080/ageWeeks/${this.state.formData.id}`
                method = 'PUT';
            } else {
                url = `http://localhost:8080/ageWeeks`
                method = 'POST';
            }
            const sendData: TreatmentsNew = {
                treatments: this.state.formData.treatments,
                weekOfLive: this.state.formData.weekOfLive
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
                    document.getElementById("closeAddWeekGroup")?.click();
                });
        }

    }

    changeHandle(event: React.ChangeEvent<HTMLInputElement>) {
        const week = event.target.value;
        this.setState((prevState) => ({
            ...prevState,
            formData: {
                ...prevState.formData,
                weekOfLive: Number(week),
                treatments: Array<Treatments>()
            }
        }))
    }

    handleSelectChange(event: MultiValue<any>) {
        const treatments = Array<{ id: number }>();
        for (const eventElement of event) {
            treatments.push({
                id: eventElement.value
            })
        }
        this.setState((prevState) => ({
            ...prevState,
            formData: {
                ...prevState.formData,
                treatments: treatments,
            }
        }))
    }

    handleDelete(id: number | null) {
        if (!id) {
            return
        }
        fetch(`http://localhost:8080/ageWeeks/${id}`, {
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

    handleEdit(id: number | null) {
        if (!id) {
            return
        }
        fetch(`http://localhost:8080/ageWeeks/${id}`, {
            "cache": "no-cache",
            method: "GET",
        })
            .then((response) => {
                if (!response.ok) {
                    throw Error("Error occurs while fetching data.")
                }
                return response.json();
            })
            .then((data) => {
                if(!data) {
                    return
                }
                this.setState((prevState) => ({
                    ...prevState,
                    formData: {
                        id: data.id,
                        treatments: data.treatments,
                        weekOfLive: data.weekOfLive,
                        error: false
                    }
                }))
            });
    }

    render() {
        const treatmentsTable = [];
        for (const treatmentsTableElement of this.state.formData.treatments) {
            treatmentsTable.push(this.state.allTreatments.find(element => element.value === treatmentsTableElement.id))
        }
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
                    <h1 className="h3 mb-0 text-gray-800">Grupy wiekowe</h1>
                </div>
                <div className="row">
                    <div className="col-xl-12 col-lg-12">
                        <div className="card shadow mb-4">
                            <div
                                className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 className="m-0 font-weight-bold text-primary">Grupy wiekowe</h6>
                                <button data-toggle="modal" data-target="#addWeekGroup"
                                        className="btn btn-success">Dodaj
                                </button>
                            </div>
                            <div className="card-body">
                                <table className="table table-bordered">
                                    <thead>
                                    <tr>
                                        <th>Tydzień życia</th>
                                        <th>Zabiegi</th>
                                        <th>Narzędzia</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.data.map((ageGroup, key) =>
                                            <tr key={key}>
                                                <td>{ageGroup.weekOfLive}</td>
                                                <td key={key}>
                                                    <table className="table-borderless">
                                                        <tbody>
                                                        {ageGroup.treatments.map((treatment) =>
                                                            <tr key={treatment.id} className="age-group-treatment">
                                                                <td><strong>Nazwa: </strong>{treatment.name}</td>
                                                                <td><strong>Opis: </strong>{treatment.description}</td>
                                                                <td><strong>Kategoria: </strong>{treatment.category}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        </tbody>
                                                    </table>
                                                </td>
                                                <td>
                                                    <span onClick={() => this.handleDelete(ageGroup.id)}
                                                          className="table-tool table-tool-delete">Usuń</span>&nbsp;
                                                    | <span onClick={() => this.handleEdit(ageGroup.id)}
                                                            data-toggle="modal" data-target="#addWeekGroup"
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
                <div className="modal fade" id="addWeekGroup" role="dialog"
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
                                    <label htmlFor="weekNumber">Numer tygodnia</label>
                                    <div className="form-group">
                                        <input className="form-control"
                                               id="weekNumber"
                                               type="number"
                                               step="1"
                                               min="0"
                                               max="200"
                                               placeholder="Wprowadź numer tygodnia"
                                               value={this.state.formData.weekOfLive ?? ""}
                                               onChange={((event) => this.changeHandle(event))}
                                        />
                                    </div>
                                    <label htmlFor="ageWeekTreatments">Zabiegi: </label>
                                    <Select
                                        id={"ageWeekTreatments"} isMulti
                                        options={this.state.allTreatments}
                                        placeholder={"Wybierz zabiegi"}
                                        value={treatmentsTable}
                                        onChange={(event) => this.handleSelectChange(event)}
                                    />
                                </form>
                            </div>

                            <div className="modal-footer">
                                <button id="closeAddWeekGroup" className="btn btn-secondary" type="button" data-dismiss="modal">Anuluj</button>
                                <button className="btn btn-primary" onClick={this.sendData}>Dodaj</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>

        );
    }
}
