const Joi = require('joi');

// require and configure dotenv, will load vars in .env to in PROCESS.ENV
require('dotenv').config({silent: true});


// define validation for all the env vars
const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string()
        .allow(['development', 'production', 'test', 'provision'])
        .default('development'),
    PORT: Joi.number()
        .default(4000),
    MONGOOSE_DEBUG: Joi.boolean()
        .when('NODE_ENV', {
            is: Joi.string().equal('development'),
            then: Joi.boolean().default(true),
            otherwise: Joi.boolean().default(false)
        }),
    JWT_SECRET: Joi.string().required()
        .description('JWT Secret required to sign')
}).unknown()
    .required();

//console.info(process.env)

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mongooseDebug: envVars.MONGOOSE_DEBUG,
    jwtSecret: envVars.JWT_SECRET,
    alert_future_min: envVars.alert_future_min,
    line_channel_token: envVars.line_channel_token,
    line_channel_secret: envVars.line_channel_secret,
    mysql_host: envVars.mysql_host,
    mysql_port: envVars.mysql_port,
    mysql_user: envVars.mysql_user,
    mysql_password: envVars.mysql_password,
    mysql_database: envVars.mysql_database,
    redis_host: envVars.redis_host,
    redis_port: envVars.redis_port,
    admingroup: envVars.admingroup,
    monitoring_time_thershold: envVars.monitoring_time_thershold
}

module.exports = config;