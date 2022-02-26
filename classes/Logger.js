/**
 * An extension of {@link console} with prefixes.
 * @param {string} identity The prefix associated with this {@link Logger}
 */
class Logger {
    /**
     * An extension of {@link console} with prefixes.
     * @param {string} identity The prefix associated with this {@link Logger}
     */
    constructor(identity) {
        this.identity = identity;
    }

    /**
     * Prints to `stdout` with newline. Multiple arguments can be passed, with the
     * first used as the primary message and all additional used as substitution
     * values similar to [`printf(3)`](http://man7.org/linux/man-pages/man3/printf.3.html) (the arguments are all passed to `util.format()`).
     *
     * ```js
     * const count = 5;
     * console.log('count: %d', count);
     * // Prints: count: 5, to stdout
     * console.log('count:', count);
     * // Prints: count: 5, to stdout
     * ```
     *
     * See `util.format()` for more information.
     * @since v0.1.100
     */
    log(msg) {
        console.log(`[${this.identity}] ${msg}`);
    }

    /**
     * The `console.warn()` function is an alias for {@link error}.
     * @since v0.1.100
     */
    warn(msg) {
        console.warn(`[${this.identity}] ${msg}`);
    }

    /**
     * Prints to `stderr` with newline. Multiple arguments can be passed, with the
     * first used as the primary message and all additional used as substitution
     * values similar to [`printf(3)`](http://man7.org/linux/man-pages/man3/printf.3.html) (the arguments are all passed to `util.format()`).
     *
     * ```js
     * const code = 5;
     * console.error('error #%d', code);
     * // Prints: error #5, to stderr
     * console.error('error', code);
     * // Prints: error 5, to stderr
     * ```
     *
     * If formatting elements (e.g. `%d`) are not found in the first string then `util.inspect()` is called on each argument and the resulting string
     * values are concatenated. See `util.format()` for more information.
     * @since v0.1.100
     */
    error(err) {
        console.error(`[${this.identity}] ${err}`);
    }
}

module.exports = Logger;
