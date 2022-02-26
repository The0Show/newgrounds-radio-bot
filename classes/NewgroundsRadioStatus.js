const axios = require("axios");

/**
 * A wrapper for the Newgrounds Radio JSON endpoint.
 */
class NewgroundsRadioStatus {
    /**
     * A wrapper for the Newgrounds Radio JSON endpoint.
     * @param {string} endpoint The domain of the endpoint. Configurable in `endpoints.json`.
     */
    constructor(endpoint) {
        this.endpoint = endpoint;
        this.axios = axios.default;
    }

    /**
     * Calls the Newgrounds Radio endpoint.
     * @returns {object} An object containing the entire status of Newgrounds Radio.
     */
    async callEndpoint() {
        const data = await this.axios
            .get(`${this.endpoint}/status-json-custom.xsl`)
            .then((res) => res.data);
        return data;
    }

    /**
     * Gets the status of a {@link mount}.
     * @param {string} mount The mount to get the status of.
     * @returns {object} An object containing the status of the provided {@link mount}.
     */
    async getMountStatus(mount) {
        const data = await this.callEndpoint();

        return data.mounts[mount];
    }
}

module.exports = NewgroundsRadioStatus;
