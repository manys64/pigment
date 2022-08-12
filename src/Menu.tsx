import React from "react";
import {Treatment} from "./Treatment";
import {AgeWeeks} from "./AgeWeeks";
import {Batches} from "./Batches";
import { TreatmentPlan } from "./TreatmentPlan";

type MenuTab = {
    name: string;
    icon: string;
    url: string;
}

type MenuGroup = {
    name: string;
    tabs: Array<MenuTab>
}

export type MenuCreator = {
    groups: Array<MenuGroup>
}

interface MenuProp {
    menu: MenuCreator;
    active: string;
    onClick: any
}

export function Menu(props: MenuProp) {
    return (
        <div className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
            <a className="sidebar-brand d-flex align-items-center justify-content-center" href="../public/index.html">
                <div className="sidebar-brand-icon rotate-n-15">
                    <i className="fas fa-piggy-bank"/>
                </div>
                <div className="sidebar-brand-text mx-3">PigMent</div>
            </a>
            {
                props.menu.groups.map((group, key) =>
                    <div key={key}>
                        <hr className="sidebar-divider"/>
                        <div className="sidebar-heading">
                            {group.name}
                        </div>
                        {
                            group.tabs.map((tab, groupKey) =>
                                <div key={groupKey} className={tab.name === props.active ? "nav-item active" : "nav-item"}>
                                    <a className="nav-link" href={tab.url} data-name={tab.name} onClick={props.onClick}>
                                        <i className={"fas fa-fw " + tab.icon}/>
                                        <span>{tab.name}</span>
                                    </a>
                                </div>
                            )
                        }
                    </div>
                )
            }
        </div>
    )
}

export const  workerMenu : MenuCreator = {
    groups: [
        {
            name: "Narzędzia główne",
            tabs: [
                {
                    name: "Plan na dziś",
                    icon: "fa-table",
                    url: "/treatments",
                }
            ]
        }
    ]
}

export const  adminMenu : MenuCreator = {
    groups: [
        {
            name: "Narzędzia główne",
            tabs: [
                {
                    name: "Zabiegi",
                    icon: "fa-book-medical",
                    url: "/treatments",
                },
                {
                    name: "Grupy wiekowe",
                    icon: "fa-paw",
                    url: "/age-weeks",
                },
                {
                    name: "Grupy produkcyjne",
                    icon: "fa-tractor",
                    url: "/batches",
                },
                {
                    name: "Plan na dziś",
                    icon: "fa-tasks",
                    url: "/tasks"
                }
            ]
        }
    ]
}

export const menusTable = {
    "ROLE_ADMIN": adminMenu,
    "ROLE_WORKER": workerMenu
}

export let componentsTable : any = {};
componentsTable["Zabiegi"] = <Treatment/>;
componentsTable["Grupy produkcyjne"] = <Batches/>;
componentsTable["Plan na dziś"] = <TreatmentPlan/>;
componentsTable["Grupy wiekowe"] = <AgeWeeks/>;
