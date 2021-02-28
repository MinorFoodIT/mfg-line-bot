const httpStatus = require('http-status');


/**
 * Class representing an API message.
 * @extends
 */
class APIResp {
    /**
     * Creates an API resp.
     * @param {string} message -  message.
     * @param {number} status - HTTP status code of success.
     * @param {boolean} isPublic - Whether the message should be visible to user or not.
     */
    constructor(message, status = httpStatus.OK, isPublic = false){
        this.message = message
        this.code = status
        this.stack = {}
        this.isPublic = isPublic
    }

    resp(){
        return {
            code: this.code,
            message: this.message,
            stack: this.stack
        }
    }

}


module.exports = APIResp;