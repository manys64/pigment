import React, {FormEvent} from 'react';
import {Blank} from "./Blank";
import {Login, User, UserRole} from "./login";
import {adminMenu, componentsTable, Menu, menusTable} from "./Menu";

type MasterState = {
    logged: boolean | User;
    page: React.ComponentElement<any, any>;
    active: string
}

export class Master extends React.Component<{}, MasterState> {
    state: MasterState = {
        logged: false,
        page: <Blank/>,
        active: "",
    }

    componentDidMount() {
        this.handleClick = this.handleClick.bind(this);
        this.handleLogOut = this.handleLogOut.bind(this);
        fetch('http://localhost:8080/myUser', {
            method: 'GET',
            credentials: 'include',
        })
            .then((response) => {
                if (!response.ok) {
                    this.setState((prevState) => ({
                        ...prevState,
                        logged: false
                    }))
                    return;
                }
                return response.json();
            })
            .then((data) => {
                this.setState((prevState) => ({
                    ...prevState,
                    logged: data
                }))
                if (typeof data === "object") {
                    data.menu = menusTable[UserRole.ROLE_ADMIN]
                }
            });
    }

    handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (event.nativeEvent.target) {
            const login = event.nativeEvent.target[0].value;
            const password = event.nativeEvent.target[1].value;
            event.preventDefault();
            const headers = new Headers();
            headers.append('Authorization', 'Basic ' + btoa(login + ":" + password));
            fetch('http://localhost:8080/myUser', {
                method: 'GET',
                credentials: 'include',
                headers: headers,
            })
                .then((response) => {
                    if (!response.ok) {
                        this.setState((prevState) => ({
                            ...prevState,
                            logged: false
                        }))
                    }
                    return response.json();
                })
                .then((data) => {
                    this.setState((prevState) => ({
                        ...prevState,
                        logged: data
                    }))
                    if (typeof data === "object") {
                        data.menu = menusTable[UserRole.ROLE_ADMIN]
                    }
                });
        }
    }

    handleClick(event: React.MouseEvent<HTMLElement>) {
        event.preventDefault();
        const active = event.currentTarget.dataset.name;
        this.setState((prevState) => ({
            ...prevState,
            active: String(active),
            page: componentsTable[String(active)]
        }))
    }

    handleLogOut() {
        this.setState((prev) => ({
            ...prev,
            logged: false
        }))
    }

    render() {
        if (!this.state.logged) {
            return <Login onSubmit={(event) => this.handleSubmit(event)}/>
        }
        return (
            <div id="wrapper">
                <div className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
                    <Menu menu={adminMenu} active={this.state.active}
                          onClick={(event: React.MouseEvent<HTMLElement>) => this.handleClick(event)}/>
                </div>
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                            <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
                                <i className="fa fa-bars"/>
                            </button>
                            <ul className="navbar-nav ml-auto" id="userInfo">
                                <span className="fit-content">Zalogowano jako:</span>
                                <span
                                    className="mr-2 d-none d-lg-inline text-gray-600 pl-3">
                                    <strong>
                                        {typeof this.state.logged === "object" ? this.state.logged.username : ""}
                                    </strong>
                                </span>
                                <div id="logOutButton" data-toggle="modal" data-target="#logoutModal">
                                    <i className="fas fa-sign-out-alt fa-lg fa-fw text-gray-400"/>
                                </div>
                            </ul>
                        </nav>
                        <div className="container-fluid">
                            {this.state.page}
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="logoutModal" tabIndex={-1} role="dialog"
                     aria-labelledby="exampleModalLabel"
                     aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
                                <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <div className="modal-body">Czy na pewno chcesz się wylogować?</div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" type="button" data-dismiss="modal">Anuluj</button>
                                <button className="btn btn-primary" data-dismiss="modal" onClick={this.handleLogOut}>Wyloguj</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
