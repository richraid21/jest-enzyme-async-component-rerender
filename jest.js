import Enzyme, { shallow, render, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import axios from 'axios'
import mocker from 'axios-mock-adapter'

Enzyme.configure({ adapter: new Adapter() })

global.shallow = shallow
global.render = render
global.mount = mount

global.axios = axios
global.mocker = mocker