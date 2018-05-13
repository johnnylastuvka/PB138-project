import axios from "axios";
import * as PubSub from "pubsub-js";
import {log} from "./generic";

axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    timeout: 600000,
    crossDomain: true,
});

export function handleHttpError(error) {
    if (error.response) {
        log(error.response);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
    } else {
        // Something happened in setting up the request that triggered an Error
        log('Error', error.message);
    }
}

// use this to post a data via api
export function put(url, data) {
    PubSub.publish('requestStarted');
    return api.put(url, data).then((response) => {
        PubSub.publish('requestFinished');
        return response;
    }).catch((e) => {
        handleHttpError(e);
        PubSub.publish('requestFinishedWithError');
        PubSub.publish('requestFinished');
    })
}

// use this to post a data via api
export function post(url, data) {
    PubSub.publish('requestStarted');
    return api.post(url, data).then((response) => {
        PubSub.publish('requestFinished');
        return response;
    }).catch((e) => {
        handleHttpError(e);
        PubSub.publish('requestFinishedWithError');
        PubSub.publish('requestFinished');
    })
}

// use this to get a json via api
export function get(url, handleError = true, config = null) {
    PubSub.publish('requestStarted');
    return api.get(url, config).then((response) => {
        PubSub.publish('requestFinished');
        return response;
    }).catch((e) => {
        if (handleError) {
            handleHttpError(e);
        }
        PubSub.publish('requestFinishedWithError');
        PubSub.publish('requestFinished');
    })
}

// use this to get a json via api
export function httpDelete(url) {
    PubSub.publish('requestStarted');
    return api.delete(url).then((response) => {
        PubSub.publish('requestFinished');
        return response;
    }).catch((e) => {
        handleHttpError(e);
        PubSub.publish('requestFinishedWithError');
        PubSub.publish('requestFinished');
    })
}

// returns axians instance api configuration
export function getApi() {
    return api;
}