var space = ' ';

var tag ={
    redis: '[redis]'+space,
    mongoose: '[mongoose]'+space,
    push_order: '[push_order]'+space,
    push_future_order: '[push_future_order]'+space,
    order_update_status: '[order_update_status]'+space,
    order_update_error: '[order_update_error]'+space,
    cached_future_morning: '[cached_future_morning]'+space,
    cached_future_due: '[cached_future_due]'+space,
    line_push_error: '[line_push_error]'+space,
    line_reply_error: '[line_reply_error]'+space,
    future_alerted: '[future_alerted]'+space,
    incomming_order: '[incomming_order]'+space,
    reqQueue_1112d_error: '[reqQueue.1112Delivery error]'+space,
    reqQueue_1112dfuture_error: '[reqQueue.1112Delivery(future) error]'+space,
    trigger_futureOrder: '[trigger_futureOrder]'+space,
    trigger_futureOnmorning: '[trigger_futureOnmorning]'+space,
    trigger_housekeeping: '[trigger_housekeeping]'+space,
    webhook: '[webhook]'+space
}

module.exports = tag