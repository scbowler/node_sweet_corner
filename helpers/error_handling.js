class StatusError extends Error {
    constructor(status, messages, defaultMessage = 'Internal Server Error') {
        super(defaultMessage);

        this.status = status;

        if (!Array.isArray(messages)) {
            messages = [messages];
        }

        this.messages = messages
    }
}

exports.StatusError = StatusError;
