import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import SignupPage from '../Signup';
import {ValidatedInput} from '../Signup';

Enzyme.configure({ adapter: new Adapter() });

//Signup component
describe('<SignupPage /> component', () => {

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

    it('should not allow signup button to be clicked with any errors', () => {
        const wrapper = mount(<SignupPage />);
        expect(wrapper.find('button').props().disabled).toEqual(true);
    });

    it('should show error when passwords do not match', () => {
        const wrapper = mount(<SignupPage />);
        wrapper.setState({'username': 'placeholder', 'password': 'testers', 'passwordMatch': 'notmatching'});
        expect(wrapper.find('.help-block').at(0).text()).toEqual("Passwords need to be the same");
    });

    it('should show error when special characters are used for username', () => {
        const wrapper = mount(<SignupPage />);
        wrapper.setState({'username': '@iou2o!'});
        expect(wrapper.find('.help-block').at(0).text()).toEqual("Username can only contain Letters, Numbers, and Spaces");
    });

    it('should show error when password is less than 6 characters', () => {
        const wrapper = mount(<SignupPage />);
        wrapper.setState({'username': 'placeholder', 'password': 'test', 'passwordMatch': 'test'});
        expect(wrapper.find('.help-block').at(0).text()).toEqual("Must be at least 6 characters.");
    });

    it('should allow signup button to be clicked without errors', () => {
        const wrapper = mount(<SignupPage />);
        wrapper.setState({'username': 'placeholder', 'password': 'tester1', 'passwordMatch': 'tester1'});
        expect(wrapper.find('button').props().disabled).toEqual(false);
    });


});