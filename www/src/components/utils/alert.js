import React from 'react';
import PropTypes from 'prop-types';
import {confirmable, createConfirmation} from 'react-confirm';
import Rodal from 'rodal';

const modalAlertDialog = ({show, proceed, dismiss, cancel, alertText, options}) => {
    return (
        <Rodal
            className={'rodal__alert'}
            onClose={dismiss}
            visible={show}
            animation='fade'
            closeOnEsc={true}
        >
            <h1 className={"text--left"}>{alertText}</h1>
            <span className={'rodal__alert__btn'} onClick={() => cancel()}>Zavřít</span>
        </Rodal>
    );
};

modalAlertDialog.propTypes = {
    show: PropTypes.bool,
    proceed: PropTypes.func,
    cancel: PropTypes.func,
    dismiss: PropTypes.func,
    alertText: PropTypes.string,
    options: PropTypes.object
};

const modalAlert = createConfirmation(confirmable(modalAlertDialog));

export default function (alertText, options = {}) {
    return modalAlert({alertText, options});
}