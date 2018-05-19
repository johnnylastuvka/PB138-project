import React from 'react';
import PropTypes from 'prop-types';
import {confirmable, createConfirmation} from 'react-confirm';
import Rodal from 'rodal';

const ConfirmDialog = ({show, proceed, dismiss, cancel, confirmText, options}) => {
    return (
        <Rodal
            className={'rodal__confirm'}
            onClose={dismiss}
            visible={show}
            animation='fade'
            closeOnEsc={true}
        >
            <h1>{confirmText}</h1>

            <div className={'rodal__confirm__buttons'}>
                <span className={'rodal__confirm__btn'} onClick={() => proceed()}>Ano</span>
                <span className={'rodal__confirm__btn rodal__confirm__btn--gray'} onClick={() => cancel()}>Ne</span>
            </div>

        </Rodal>
    );
};

ConfirmDialog.propTypes = {
    show: PropTypes.bool,
    proceed: PropTypes.func,
    cancel: PropTypes.func,
    dismiss: PropTypes.func,
    confirmText: PropTypes.string,
    options: PropTypes.object
};

const confirm = createConfirmation(confirmable(ConfirmDialog));

export default function (confirmText, options = {}) {
    return confirm({confirmText, options});
}