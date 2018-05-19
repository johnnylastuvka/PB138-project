export function log(data) {
    if (isDebugEnabled()) {
        console.log(data);
    }
}

export function isDebugEnabled() {
    return process.env.REACT_APP_DEBUG === 1;
}
