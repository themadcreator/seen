import * as React from "react";

export interface HelloProps { input: string }

export class Comp extends React.Component<HelloProps, {}> {
    public render() {
        return (
            <h1 onClick={this.handleClick}>Hello {this.props.input}!</h1>
        );
    }

    public handleClick = () => {
        console.log("CLICKED");
    }

}