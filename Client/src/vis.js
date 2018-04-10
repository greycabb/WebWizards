const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const size = 600;

class CustomD3Component extends D3Component {


    constructor(props) {
        super(props);

        this.state = {
            'animation': 0 // isotonic, hypertonic, hypotonic
        };
    }

    initialize(node, props) {
        // const svg = this.svg = d3.select(node).append('svg');
        // svg.attr('viewBox', `0 0 ${size} ${size}`)
        //     .style('width', '100%')
        //     .style('height', 'auto');

        // svg.append('circle')
        //     .attr('r', 20)
        //     .attr('cx', Math.random() * size)
        //     .attr('cy', Math.random() * size);

        const svg = this.svg = d3.select(node).append("svg");

        var blob = svg.append('ellipse')
            .attr('cx', 200)
            .attr('cy', 200)
            .style('fill', 'red')
            .attr('rx', 50)
            .attr('ry', 30);

        // Red blob
        function pulse() {
            (function repeat() {
                blob = blob
                    .transition().duration(600)
                    .attr('r', '65')
                    .transition().duration(400)
                    .attr('r', '50')
                    .on('end', repeat);
            })();

        }
    }

    // Hypotonic: entering circle
    // Hypertonic: leaving circle

    update(props) {
        // this.svg.selectAll('circle')
        //     .transition()
        //     .duration(750)
        //     .delay(4 * 750)
        //     .attr('cx', Math.random() * size)
        //     .attr('cy', Math.random() * size);
        switch(this.state.animation) {
            case 0:
                svg.selectAll('ellipse').each(pulse);
                break;
            case 1:
                break;
            case 2:
                break;
        }
    }
}



module.exports = CustomD3Component;