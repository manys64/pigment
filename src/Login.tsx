import React, {ChangeEvent, FormEventHandler} from "react";
import {MenuCreator} from "./Menu";

type LoginState = {
    login: string;
    password: string;
    logged: boolean | User;
    error: boolean;
}

export enum UserRole {
    ROLE_ADMIN = "ROLE_ADMIN",
    ROLE_WORKER = "ROLE_WORKER"
}

export type User = {
    id: number,
    username: string,
    role: UserRole,
    menu: MenuCreator
}

export class Login extends React.Component<{onSubmit: FormEventHandler}, LoginState> {
    state = {
        login: "",
        password: "",
        logged: false,
        error: false,
    }

    constructor(props: any) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: ChangeEvent<HTMLInputElement>) {
        switch (event.target.id) {
            case "inputEmail":
                this.setState((prevState) => ({
                    ...prevState,
                    login: event.target.value,
                    error: false
                }))
                break;
            case "inputPassword":
                this.setState((prevState) => ({
                    ...prevState,
                    password: event.target.value,
                    error: false
                }))
        }
    }

    render() {
        if (this.state.logged) {
            return <></>;
        }
        return (
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-10 col-lg-12 col-md-9">
                        <div className="card o-hidden border-0 shadow-lg my-5">
                            <div className="card-body p-0">
                                <div className="row">
                                    <div className="col-lg-6 d-none d-lg-block bg-login-image"/>
                                    <div className="col-lg-6">
                                        <div className="p-5">
                                            <div className="text-center">
                                                <h1 className="h4 text-gray-900 mb-4">Zaloguj się do systemu PigMent</h1>
                                            </div>
                                            <form className="user" onSubmit={this.props.onSubmit}>
                                                <div className="form-group">
                                                    <input className="form-control form-control-user"
                                                           id="inputEmail" aria-describedby="emailHelp"
                                                           placeholder="Wprowadź login"
                                                           value={this.state.login}
                                                           onChange={this.handleChange}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <input type="password" className="form-control form-control-user"
                                                           id="inputPassword" placeholder="Hasło"
                                                           value={this.state.password}
                                                           onChange={this.handleChange}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <div className="custom-control custom-checkbox small">
                                                        <input type="checkbox" className="custom-control-input"
                                                               id="customCheck"/>
                                                        <label className="custom-control-label" htmlFor="customCheck">Zapamiętaj mnie</label>
                                                    </div>
                                                </div>
                                                <input type="submit" value="Zaloguj"
                                                       className="btn btn-primary btn-user btn-block"/>
                                            </form>
                                            <hr/>
                                            <div className="text-center">
                                                <a className="small" href="/">Zapomniałeś hasło?</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

