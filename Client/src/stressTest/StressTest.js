/*
    Make 5000 API calls asynchronously from 2000 users

*/

var fetch = require("node-fetch");
function time() {
    return new Date().getTime();
}

testGetBlock(5000);


//_________________________
function testGetBlock(targetCount) {
    let times = [];
    let initialTime = time();

    let count = 0;
    let apiFailCount = 0;
    let userCount = 2000;
    let firstFailure = -1;

    function finished() {
        console.log('Total time for ' + targetCount + ' calls in ' + ((time() - initialTime) / 1000) + ' seconds');
        let sum = times.reduce(function (a, b) { return a + b; });
        let avg = sum / times.length;
        console.log('Average time: ' + (avg / 1000) + ' seconds');
        console.log('Failure rate: ' + apiFailCount + ' in ' + targetCount);
        console.log('First failure: ' + firstFailure);
    }

    function run() {
        let startTime = time();
        setTimeout(function () {
            fetch('https://api.webwizards.me/v1/blocks?id=5b0c3cfb4c06fb0001dcdc91', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
                .then(function (response) {

                    if (response.ok) {
                        response.json().then(function (result) {
                            times.push(((time() - startTime) / 1000));
                            count++;
                            if (count % 1000 === 0) {
                                console.log(count);
                            }
                            if (count < targetCount) {
                                run();
                            } else if (count === targetCount) {
                                finished();
                            }

                        });
                    } else {
                        response.text().then(text => {
                            console.log(text);
                        });

                    }
                })
                .catch(function () {
                    count++;
                    if (count < targetCount) {
                        apiFailCount++;
                        if (firstFailure === -1) {
                            firstFailure = count;
                            console.log('First failure: ' + count);
                        }
                    }
                    else if (count === targetCount) {
                        console.log('Finished! ' + targetCount + ' calls in ' + ((time() - initialTime) / 1000) + ' seconds');
                        let sum = times.reduce(function (a, b) { return a + b; });
                        let avg = sum / times.length;
                        console.log('Average time: ' + (avg / 1000) + ' seconds');
                        console.log('Failure rate: ' + apiFailCount + ' in ' + targetCount);
                        console.log('First failure: ' + firstFailure);
                    }
                });
        }, 1);
    }

    // Simulate 2000 users
    console.log();
    console.log();
    console.log();
    console.log();
    console.log('_________________________')
    console.log('===' + targetCount + ' Calls START===');
    for (var i = 0; i < 2000; i++) {
        run();
    }
}