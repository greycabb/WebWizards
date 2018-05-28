import React from 'react';
import { shallow, mount } from 'enzyme';
//import sinon from 'sinon';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import LoginPage from '../Login';
import { ValidatedInput } from '../Login';



Enzyme.configure({ adapter: new Adapter() });

//Login component
describe('<LoginPage /> component', () => {

  beforeAll(() => {
    global.localStorage = {
      i2x_token: 'someToken',
      getItem: function () {
        return 'someToken'
      },
      clear: function () {
        return ''
      }
    };
  });

  it('should have a disabled login button if both username and password fields are blank', () => {
    const wrapper = mount(<LoginPage />);

    wrapper.setState({
      'mobileView': false,
      'loginClicked': true
    });
    expect(wrapper.find('#loginTrigger').props().disabled).toEqual(true);
  });

  // 2)
  it('should have an enabled login button if both username and password are filled out', () => {
    const wrapper = mount(<LoginPage />);

    wrapper.setState({
      'mobileView': false,
      'loginClicked': true,
      'username': 'test',
      'password': 'password'
    });
    expect(wrapper.find('#loginTrigger').props().disabled).toEqual(false);
  });

  // 3)
  it('should have a disabled login button if password is missing, but not username', () => {
    const wrapper = mount(<LoginPage />);

    wrapper.setState({
      'mobileView': false,
      'loginClicked': true,
      'username': 'test',
      'password': ''
    });
    expect(wrapper.find('#loginTrigger').props().disabled).toEqual(true);
  });

  // 3)
  it('should have a disabled login button if username is missing, but not password', () => {
    const wrapper = mount(<LoginPage />);

    wrapper.setState({
      'mobileView': false,
      'loginClicked': true,
      'username': '',
      'password': 'password'
    });
    expect(wrapper.find('#loginTrigger').props().disabled).toEqual(true);
  });

  // // 4)
  // it('should not reject login when both username and password are filled out and are correct', () => {
  //   const wrapper = shallow(<LoginPage />);

  //   wrapper.setState({
  //     'mobileView': false,
  //     'loginClicked': true,
  //     'username': 'test',
  //     'password': 'password'
  //   });

  //   wrapper.find('#loginTrigger').simulate('click');

  //   setTimeout(() => {
  //     expect(wrapper.state.error).toEqual('');
  //     done();
  //   }, 5000);
  // });

  // // 4)
  // it('should reject login when both username and password are filled out and are wrong', () => {
  //   const wrapper = shallow(<LoginPage />);

  //   wrapper.setState({
  //     'mobileView': false,
  //     'loginClicked': true,
  //     'username': 'test',
  //     'password': 'not the right password'
  //   });

  //   wrapper.find('#loginTrigger').simulate('click');

  //   setTimeout(() => {
  //     expect(wrapper.state.error).toEqual('invalid credentials');
  //     done();
  //   }, 5000);
  // });
});