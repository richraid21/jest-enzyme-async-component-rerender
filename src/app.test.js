import React from 'react'
import App from './app'
import { setImmediate } from 'timers'
import { EventEmitter } from 'events';
const util = require('util');
const log = util.debuglog('jest');

describe('App', () => {
    const originals = {}
    let mock

    beforeAll(() => {
        originals.setState = App.prototype.setState

        mock = new mocker(axios, { delayResponse: 1000 })
        
        const data = { bpi: { "USD": { rate: 50}}}
        mock.onGet('https://api.coindesk.com/v1/bpi/currentprice/USD.json').reply(200, data)
    })

    afterEach(() => {
        App.prototype.setState = originals.setState
    })

    // Test the default state of the component
    test('App initializes correctly', () => {
        const shallowApp = shallow(<App />);
        expect(shallowApp.state('price')).toBe(0)
    });
    
    // Ensure setState gets called on mounting (via known action of componentDidMount())
    test('App mounts correctly', (done) => {
        expect.assertions(1)
        let mountApp

        const setState = App.prototype.setState = jest.fn()
        mountApp = mount(<App />)
        
        // We want to send the assertion to the back of the callstack. The axios mock is going to synchronously return
        // and we will schedule our test to follow that return.
        // To test a delayed response (delayedResponse: int), the timeout period should be >= to the delay
        setTimeout(() => {
            expect(setState).toBeCalledWith({ price: 50})
            done()
        }, 0)

    });

    // Ensure the results of a setState call are what we desire
    test('App renders correctly', (done) => {
        expect.assertions(1)
        const mountApp = mount(<App />)
        
        mountApp.setState({ price: 50 }, () => {
            const el = mountApp.find('.price').first().getElement()
            expect(el.props.children[1]).toBe(50)
            done()
        })
    })

    // This test should really be split up, but the primary purpose is to show how to use
    // the state emitter
    test.only('Combined render and update with async - new', (done) => {
        expect.assertions(3)

        const EnzymeStateChangeEmitter = require('./EnzymeStateChangeEmitter')
        const app = new EnzymeStateChangeEmitter(<App />)

        // The first state change is from the mock response
        // The current state of the component should be the default, 0
        // <method>:<lifecycleStage>:<invocationCount>
        app.on('setState:begin:1', (context) => {
            expect(app.wrapper.state('price')).toBe(0)
        })

        // The first completed state change should be the price from the mock response, 50
        // We then trigger a button click
        app.on('setState:complete:1', (context) => {
            expect(app.wrapper.state('price')).toBe(50)
            app.wrapper.find('button').simulate('click')
        })

        // The 2nd completed state change should be from the result of the button click, 50 + 10
        app.on('setState:complete:2', (context) => {
            expect(app.wrapper.state('price')).toBe(60)
            done()
        })

        app.mount()

    })

    test('Combined render and update with async ComponentDidUpdate', (done) => {
        expect.assertions(1)
        let app, originalCallback

        const assert = () => {
            expect(app.state('price')).toBe(50)
            
            // If the component had a real callback, we need to make sure that runs
            if (typeof originalCallback === 'function'){
                originalCallback()
            }

            done()
        }
        
        const setState = React.Component.prototype.setState
        // Intercept the component setState method so we can inject our assertions
        React.Component.prototype.setState = function(){
            originalCallback = arguments[1]
            // Invoke the original setState with the proper context, state argument, but with our assertion callback
            setState.apply(this, [arguments[0], assert])
        }
        
        app = mount(<App />)
    })
})