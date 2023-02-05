'use strict';

document.addEventListener('DOMContentLoaded', function() {

    // advantages

    var advantagesAnchors = document.querySelectorAll('.advantages-columns-item');
    var advantagesTexts = document.querySelectorAll('.advantages-text-item');

    var showAdvantage = function(index) {
        Array.prototype.forEach.call(advantagesAnchors, function(el) {
            el.classList.remove('active');
        });
        advantagesAnchors[index].classList.add('active');
        Array.prototype.forEach.call(advantagesTexts, function(el) {
            el.classList.remove('active');
        });
        advantagesTexts[index].classList.add('active');
    };

    showAdvantage(0);

    Array.prototype.forEach.call(advantagesAnchors, function(el) {
        el.addEventListener('click', function() {
            showAdvantage(parseInt(this.getAttribute('data-advantage-id'), 10));
        });
    });



    // BTC rate

    var rateNumber = document.querySelector('.rate-number');

    var requestRate = function() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    var rate = parseFloat(response.bpi.USD.rate);
                    rateNumber.title = 'Обновлено: ' + new Date(Date.parse(response.time.updatedISO));
                    rateNumber.innerHTML = rate.toFixed(2);
                } catch(e) {
                    console.warn('failed to get and parse BTC rate');
                }
                setTimeout(requestRate, 5000);
            }
        };
        xhr.open('GET', 'http://api.coindesk.com/v1/bpi/currentprice.json?time=' + Date.now());
        xhr.send(null);
    };

    requestRate();



    // smooth scroll

    // easing function: thanks http://gizma.com/easing/
    var easeInOutQuad = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    var duration = 150;
    var currentTime = 0;

    var smoothScroll = function(from, to) {
        var val = easeInOutQuad(currentTime, 0, to - from, duration);
        if (val < to - from) {
            window.scrollTo(0, val + from);
            currentTime++;
            setTimeout(smoothScroll.bind(null, from, to), 0);
        } else {
            window.scrollTo(0, to);
            currentTime = 0;
        }
    };

    var headerHeight = document.querySelector('.header').clientHeight;
    var anchors = document.querySelectorAll('.scroll-anchor');

    Array.prototype.forEach.call(anchors, function(el) {
        el.addEventListener('click', function() {
            var target = document.querySelector(this.getAttribute('data-target'));

            if (target) {
                smoothScroll(window.scrollY, target.offsetTop - headerHeight);
                var value = this.getAttribute('data-value');
                if (value) {
                    profitInput.value = value;
                    handleValue();
                    setTimeout(function() {
                        profitInput.focus();
                    }, 500);
                }
            } else {
                console.warn('no target with class %s was found', this.getAttribute('data-target'));
            }
        });
    });



    // setnumber

    var setNumber = function(value) {
        var opts = {
            nan: function() {
                throw new Error('Failed to parse the string');
                el.innerHTML = value;
                return;
            },
            parts: 150
        };

        var el = this;
        var property = 'value' in el ? 'value' : 'innerHTML';
        var number = parseFloat(el[property]);
        var value = parseFloat(value);
        var decimal;

        if ( isNaN(parseFloat(value)) || !isFinite(value) ) return opts.nan();

        if (!value) value = 0;

        var getDecimal = function(number) {
            var dec;
            try {
                dec = number.toString().split('.')[1].length;
            } catch(e) {
                dec = 0;
            }
            return dec;
        }

        decimal = Math.max(getDecimal(value), getDecimal(number));

        var sign = 1; // increasing

        if (value === number) {
            el[property] = value.toFixed(decimal);
            return;
        } else if (value < number) {
            sign = -1; // decreasing
        }

        var n = opts.parts;
        var k = Math.log(Math.abs(value - number)) / n;
        var parts = [];
        var sum = 0;

        for (; n > 0; n--) {
            parts.push( Math.pow(Math.E, k * n) - Math.pow(Math.E, k * (n - 1)) );
        }
        var counter = 0;

        var increase = function() {
            number += parts.shift(0) * sign;
            el[property] = number.toFixed(decimal);

            if (parts.length) {
                requestAnimationFrame(increase);
            } else {
                el[property] = value.toFixed(decimal);
            }
        };

        requestAnimationFrame(increase);
    };



    // sliding blocks

    var containers = Array.prototype.slice.call(document.querySelectorAll('.listen-scroll'));
    var treshold = 250;

    var checkOffset = function() {
        if (!points.length) {
            console.log('nothing to show, removing listener');
            window.removeEventListener('scroll', checkOffset);
            window.onload = null;
        } else {
            points.forEach(function(el) {
                if (window.scrollY + window.innerHeight - treshold > el) {
                    console.log('triggered!', el);
                    var index = points.indexOf(el);
                    switch(containers[index].getAttribute('data-onslide')) {
                        case 'stats':
                            Array.prototype.forEach.call(document.querySelectorAll('.stats-number-desktop'), function(el, i) {
                                if (el.clientHeight === 0) {
                                    console.log('element is hidden');
                                } else {
                                    setTimeout(function() {
                                        setNumber.call(el, el.getAttribute('data-target-value'));
                                    }, 1000 * i);
                                }
                            });
                        break;
                        default:
                            containers[index].classList.add('active');
                    }
                    points.splice(index, 1);
                    containers.splice(index, 1);
                }
            });
        }
    };

    var points = [];
    var getPoints = function() {
        points = Array.prototype.map.call(containers, function(el) {
            return el.offsetTop;
        });
        checkOffset();
    };
    getPoints();
    window.onload = getPoints;

    window.addEventListener('scroll', checkOffset);


    // calculator

    var changeValue = function(input) {
        var delimiterFound = false;
        var delimiter;
        var value = input.value;

        // remember cursor position
        var start = input.selectionStart;
        var end = input.selectionEnd;

        // clear the string from non-digits and excessive delimiters
        var clearString = value.replace(/\D/g, function(m) {
            if (!delimiterFound) {
                var match = m.match(/[.,]/);
                if (match) {
                    delimiterFound = true;
                    delimiter = match[0];
                    return match;
                }
            }
            return '';
        });

        // remember how many symbols from user input were cut
        var inputLength = value.length - clearString.length;

        // remove excessive digits
        clearString = clearString.split(delimiter).map(function(p, i) {
            return p.substr(0, i === 0 ? 5 : 2);
        }).join(delimiter);

        // remember string's length to count spaces after
        var lengthBefore = clearString.length;

        // insert stuff
        clearString = '$' + clearString;

        // substract inserted spaces from cursor position
        inputLength = inputLength - (clearString.length - lengthBefore);

        input.value = clearString;
        input.setSelectionRange(start - inputLength, end - inputLength);
    };

    var profitDay = document.querySelector('.profit-day span');
    var profitMonth = document.querySelector('.profit-month span');
    var profitYear = document.querySelector('.profit-year span');

    var handleValue = function() {
        changeValue(profitInput);
        var base = parseFloat(profitInput.value.substr(1)) || 0;

        if (base > 10000) {
            profitInput.value = '$10000';
            base = 10000;
        }

        var dailyProfit;

        if (base < 15) {
            dailyProfit = 0;
        } else if (base >= 15 && base <= 100) {
            dailyProfit = base * 0.03;
        } else if (base > 100 && base <= 1000) {
            dailyProfit = base * 0.0375;
        } else if (base > 1000) {
            dailyProfit = base * 0.0425;
        }

        profitDay.innerHTML = dailyProfit.toFixed(2);
        profitMonth.innerHTML = (dailyProfit * 60).toFixed(2);
        profitYear.innerHTML = (dailyProfit * 365).toFixed(2);
    }

    var profitInput = document.querySelector('.profit-input input');

    profitInput.addEventListener('input', handleValue);
    handleValue();
});