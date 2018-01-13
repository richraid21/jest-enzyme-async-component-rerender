import React from 'react'
import App from './app'
import { setImmediate } from 'timers'

describe('App', () => {
    const originals = {}
    let mock

    beforeAll(() => {
        originals.setState = App.prototype.setState

        mock = new mocker(axios)
        
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
})