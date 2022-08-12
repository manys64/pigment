import React from 'react';
import {AgeWeeksInterface} from './AgeWeeks';
import './App.css';
import {BatchesInterface} from './Batches';
import {DateHelper} from './DateHelper';

export interface Treatments {
    id: number,
    name: string,
    category: string,
    description: string,
}

type exampleTableProps = {}

interface BatchWeek {
    id: number,
    week: number
}

enum Category {
    ALL = "all",
    STANDARD = "STANDARD",
    DRUG = "DRUG"
}

type TreatmentState = {
    data: Array<Treatments>
    ageWeeks: Array<AgeWeeksInterface>
    batches: Array<BatchWeek>
    filter: Category
}

export class TreatmentPlan extends React.Component<exampleTableProps, TreatmentState> {
    state: TreatmentState = {
        data: Array<Treatments>(),
        ageWeeks: Array<AgeWeeksInterface>(),
        batches: Array<BatchWeek>(),
        filter: Category.ALL
    }

    constructor(props: exampleTableProps | Readonly<exampleTableProps>) {
        super(props);
        this.updateTable();
        this.getAgeWeeks();
        this.getBatches();
    }

    updateTable() {
        let url: string;
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
                    data: data
                }))
            });
    }

    getBatches() {
        fetch('http://localhost:8080/productionBatches', {
            "cache": "no-cache"
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error occurs while fetching data");
                }
                return response.json();
            })
            .then((data: Array<BatchesInterface>) => {
                const batches = Array<BatchWeek>();
                for (const batch of data.filter(x => x.saleDate === null)) {
                    batches.push({
                        id: batch.id,
                        week: DateHelper.weeksBetween(new Date(batch.birthPeriodStart), new Date())
                    })
                }
                this.setState((prevState) => ({
                    ...prevState,
                    batches: batches
                }))
            });
    }

    getAgeWeeks() {
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
                    ageWeeks: data
                }))
            });
    }

    render() {
        let tasks: { [key: number]: Array<BatchWeek> } = {};
        let tasksCounter = 0;
        for (const treatment of this.state.data) {
            tasks[treatment.id] = this.state.batches.filter(
                batch =>
                    this.state.ageWeeks.filter(
                        ageWeek => ageWeek.treatments.filter(
                            treatmentF => treatmentF.id === treatment.id).length > 0
                    ).filter(b => b.weekOfLive === batch.week).length > 0
            )
            tasksCounter += tasks[treatment.id].length;
        }
        const groupUsed = Array<Number>();
        for (const treatment of this.state.data) {
            for (const task of tasks[treatment.id]) {
                if (!groupUsed.includes(task.id)) {
                    groupUsed.push(task.id);
                }
            }
        }

        const filter = this.state.filter === Category.ALL ? ""
            : this.state.filter
        return (
            <>
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h3 mb-0 text-gray-800">Zaplanowane na dziś</h1>
                </div>
                <div className="row">
                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-left-info shadow h-100 py-2">
                            <div className="card-body">
                                <div className="row no-gutters align-items-center">
                                    <div className="col mr-2">
                                        <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Zadania
                                        </div>
                                        <div className="row no-gutters align-items-center">
                                            <div className="col-auto">
                                                <div
                                                    className="h5 mb-0 mr-3 font-weight-bold text-gray-800">{tasksCounter}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-left-warning shadow h-100 py-2">
                            <div className="card-body">
                                <div className="row no-gutters align-items-center">
                                    <div className="col mr-2">
                                        <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                            Grupy do obsłużenia
                                        </div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-800">{groupUsed.length}</div>
                                    </div>
                                    <div className="col-auto">
                                        <i className="fas fa-comments fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xl-12 col-lg-12">
                        <div className="card shadow mb-4">
                            <div
                                className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 className="m-0 font-weight-bold text-primary">Zaplanowane na dziś&nbsp;
                                    <small>{filter}</small>
                                </h6>
                                <div>
                                    <button className="btn btn-secondary mr-1"
                                            onClick={() => this.handleFilter(Category.ALL)}>WSZYSTKIE
                                    </button>
                                    <button className="btn btn-secondary mr-1"
                                            onClick={() => this.handleFilter(Category.STANDARD)}>{Category.STANDARD}</button>
                                    <button className="btn btn-secondary mr-1"
                                            onClick={() => this.handleFilter(Category.DRUG)}>{Category.DRUG}</button>
                                </div>
                            </div>
                            <div className="card-body">
                                <table className="table table-bordered">
                                    <thead>
                                    <tr>
                                        <th>Nazwa</th>
                                        <th>Kategoria</th>
                                        <th>Opis</th>
                                        <th>ID grup</th>
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
                                                    {
                                                        tasks[treatment.id].map((week, key) =>
                                                            <span key={key}>{week.id + ", "}</span>
                                                        )
                                                    }
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
            </>
        )
    }

    private handleFilter(category: Category) {
        this.setState((prevState) => ({
            ...prevState,
            filter: category
        }))
        this.updateTable();
    }
}

