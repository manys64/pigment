import React from 'react';
import './App.css';

export interface Treatments {
    id: number,
    name: string,
    category: string,
    description: string,
}

type exampleTableProps = {}

enum Category {
    ALL = "all",
    STANDARD = "STANDARD",
    DRUG = "DRUG"
}

type TreatmentState = {
    data: Array<Treatments>
    formData: {
        id: number | null;
        name: string | null;
        description: string | null;
        category: string | null;
        error: boolean
    },
    deleted: boolean
    filter: Category
}

class Treatment extends React.Component<exampleTableProps, TreatmentState> {
    state : TreatmentState = {
        data: Array<Treatments>(),
        formData: {
            id: null,
            name: null,
            category: null,
            description: null,
            error: false
        },
        deleted: false,
        filter: Category.ALL
    }

    constructor(props: exampleTableProps | Readonly<exampleTableProps>) {
        super(props);
        this.sendData = this.sendData.bind(this);
        this.changeHandle = this.changeHandle.bind(this);
        this.removeDeleted = this.removeDeleted.bind(this);
        this.updateTable()
    }

    updateTable() {
        let url : string;
        switch (this.state.filter) {
            case Category.ALL:
                url = "treatments"
                break;
            case Category.DRUG:
                url = "treatmentsDrug"
                break;
            case Category.STANDARD:
                url = "treatmentsStandard";
                break;
        }
        fetch(`http://localhost:8080/${url}`, {
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
                        name: null,
                        description: null,
                        category: Category.DRUG
                    }
                }))
            });
    }

    sendData(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        if (this.state.formData.name && this.state.formData.description) {
            let url : string;
            let method : string;
            if (this.state.formData.id){
                url = `http://localhost:8080/treatments/${this.state.formData.id}`
                method = 'PUT';
            } else {
                url = `http://localhost:8080/treatments`
                method = 'POST';
            }
            const sendData = {
                name: this.state.formData.name,
                description: this.state.formData.description,
                category: this.state.formData.category
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
        const value = event.target.value;
        switch (event.target.id) {
            case "treatmentsName":
                this.setState((prevState) => ({
                    ...prevState,
                    formData: {
                        ...prevState.formData,
                        name: value
                    }
                }))
                break;
            case "treatmentsDescription":
                this.setState((prevState) => ({
                    ...prevState,
                    formData: {
                        ...prevState.formData,
                        description: value
                    }
                }))
                break;
        }
    }

    handleDelete(id: number | null) {
        if (!id) {
            return
        }
        fetch(`http://localhost:8080/treatments/${id}`, {
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
        fetch(`http://localhost:8080/treatments/${id}`, {
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
                        name: data.name,
                        description: data.description,
                        category: data.category,
                        error: false
                    }
                }))
            });
    }

    render() {
        const filter = this.state.filter === Category.ALL ? ""
            : this.state.filter
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
                    <h1 className="h3 mb-0 text-gray-800">Wszystkie zabiegi</h1>
                </div>
                <div className="row">
                    <div className="col-xl-12 col-lg-12">
                        <div className="card shadow mb-4">
                            <div
                                className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 className="m-0 font-weight-bold text-primary">Wykonywalne zabiegi&nbsp;
                                    <small>{filter}</small>
                                </h6>
                                <div>
                                    <button className="btn btn-secondary mr-1" onClick={() => this.handleFilter(Category.ALL)}>WSZYSTKIE</button>
                                    <button className="btn btn-secondary mr-1" onClick={() => this.handleFilter(Category.STANDARD)}>{Category.STANDARD}</button>
                                    <button className="btn btn-secondary mr-1" onClick={() => this.handleFilter(Category.DRUG)}>{Category.DRUG}</button>
                                    <button data-toggle="modal" data-target="#addTreatment"
                                            className="btn btn-success mr-1">Dodaj
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <table className="table table-bordered">
                                    <thead>
                                    <tr>
                                        <th>Nazwa</th>
                                        <th>Kategoria</th>
                                        <th>Opis</th>
                                        <th>Narzędzia</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.data.map((treatment, key) =>
                                            <tr key={key}>
                                                <td>{treatment.name}</td>
                                                <td>{treatment.category}</td>
                                                <td>{treatment.description}</td>
                                                <td>
                                                    <span onClick={() => this.handleDelete(treatment.id)}
                                                          className="table-tool table-tool-delete">Usuń</span>&nbsp;
                                                    | <span onClick={() => this.handleEdit(treatment.id)}
                                                            data-toggle="modal" data-target="#addTreatment"
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
                <div className="modal fade" id="addTreatment" role="dialog"
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
                                    <label htmlFor="treatmentsName">Nazwa</label>
                                    <div className="form-group">
                                        <input className="form-control"
                                               id="treatmentsName"
                                               placeholder="Wprowadź nazwę"
                                               value={this.state.formData.name ?? ""}
                                               onChange={event => this.changeHandle(event)}
                                        />
                                    </div>
                                    <label htmlFor="treatmentsDescription">Opis</label>
                                    <div className="form-group">
                                        <input className="form-control"
                                               id="treatmentsDescription"
                                               placeholder="Wprowadź opis"
                                               value={this.state.formData.description ?? ""}
                                               onChange={event => this.changeHandle(event)}
                                        />
                                    </div>
                                    <label htmlFor="treatmentsCategory">Kategoria</label>
                                    <div className="form-group">
                                        <select className="form-control"
                                               id="treatmentsCategory"
                                               onChange={event => this.changeHandleSelect(event)}
                                        >
                                            <option value={Category.DRUG}>{Category.DRUG}</option>
                                            <option value={Category.STANDARD}>{Category.STANDARD}</option>
                                        </select>
                                    </div>
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
        )
    }

    private changeHandleSelect(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setState((prevState) => ({
            ...prevState,
            formData: {
                ...prevState.formData,
                category: event.target.value
            }
        }))
    }

    private handleFilter(category: Category) {
        this.setState((prevState) => ({
            ...prevState,
            filter: category
        }))
        this.updateTable();
    }
}

export {Treatment};
