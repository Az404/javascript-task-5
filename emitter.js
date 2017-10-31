'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;

module.exports = getEmitter;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    let handlers = {};

    function getHandlers(event) {
        if (!(event in handlers)) {
            handlers[event] = [];
        }

        return handlers[event];
    }

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} emitter
         */
        on: function (event, context, handler) {
            getHandlers(event).push({
                context,
                handler: function () {
                    handler.call(context);
                }
            });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} emitter
         */
        off: function (event, context) {
            try {
                Object.keys(handlers)
                    .filter(key => key === event || key.startsWith(event + '.'))
                    .forEach(key => {
                        handlers[key] = getHandlers(key)
                            .filter(handler => handler.context !== context);
                    });
            } catch (err) {
                return this;
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} emitter
         */
        emit: function (event) {
            do {
                getHandlers(event).forEach(handler => handler.handler());

                let nextEventEnd = event.lastIndexOf('.');
                if (nextEventEnd < 0) {
                    nextEventEnd = 0;
                }
                event = event.slice(0, nextEventEnd);
            } while (event !== '');

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} emitter
         */
        several: function (event, context, handler, times) {
            if (times <= 0) {
                return this.on(event, context, handler);
            }

            getHandlers(event).push({
                context,
                handler: function () {
                    if (this.times <= 0) {
                        return;
                    }
                    handler.call(context);
                    this.times--;
                },
                times
            });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object} emitter
         */
        through: function (event, context, handler, frequency) {
            if (frequency <= 0) {
                return this.on(event, context, handler);
            }

            getHandlers(event).push({
                context,
                handler: function () {
                    if (this.callCount % frequency === 0) {
                        handler.call(context);
                    }
                    this.callCount++;
                },
                callCount: 0
            });

            return this;
        }
    };
}
