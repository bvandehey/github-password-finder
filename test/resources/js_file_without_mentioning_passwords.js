'use strict';

class MyClass {

}

function test() {
    new MyClass();
    if (false) {
        return 1;
    }
    return 0;
}

module.exports.myFunction = () => test();