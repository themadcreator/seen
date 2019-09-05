import * as React from "react";
import "./theme.css";

export interface IPageProps {
    header: string;
}

export class Page extends React.Component<IPageProps, {}> {
    public render() {
        return (
            <>
                <div className="page">
                    <h1>{this.props.header}</h1>
                    {this.props.children}
                </div>
            </>
        );
    }
}