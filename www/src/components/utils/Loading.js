import React, {Component} from "react";
import * as PubSub from "pubsub-js";

class Loading extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: props.show ? props.show : false
        }
    }

    componentWillMount = function () {
        this._requestStarted = PubSub.subscribe('requestStarted', this.requestStarted.bind(this));
        this._requestFinished = PubSub.subscribe('requestFinished', this.requestFinished.bind(this));
    };

    componentWillUnmount = function () {
        PubSub.unsubscribe(this._requestStarted);
        PubSub.unsubscribe(this._requestFinished);
    };

    requestStarted = function (msg, data) {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        this._timeout = setTimeout(() => {
            document.body.classList.add('page-loading');
            this.setState({show: true});
        }, 200);
    };

    requestFinished = function (msg, data) {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        this.setState({show: false});
        document.body.classList.remove('page-loading');
    };

    render() {
        return (
            <div className={'row loading-overlay' + (this.state.show ? '' : ' d-none')}>
                <img src="/img/spinner.gif" alt="loading..."/>
            </div>
        );
    }
}

export default Loading;