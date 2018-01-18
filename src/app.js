import React from 'react'
import axios from 'axios'

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { price: 0 }

        this.addMoney = this.addMoney.bind(this)
    }

    addMoney(){
        this.setState({ price: this.state.price + 10 })
    }

    componentDidMount(){
        axios.get('https://api.coindesk.com/v1/bpi/currentprice/USD.json')
            .then((res) => {
                this.setState({price: res.data['bpi']['USD'].rate})
            })
    }
    
    render() {
      return (
        <div>
            <h1>1 BTC = <span className="price">${this.state.price}</span> USD</h1>
            <button onClick={this.addMoney}>Give me Money!</button>
        </div>
      )
    }
}