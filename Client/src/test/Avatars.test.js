import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';

import AvatarModal from '../AvatarModal';

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

//Signup component
describe('<AvatarModal /> component', () => {

  it('should show 5 default avatars', () => {

    global.localStorage = {
      i2x_token: 'someToken',
      getItem: function () {
        return "{\"points\": 49}"
      }
    };
    const wrapper = mount(<AvatarModal />);
    expect(wrapper.state().imgs.length).toEqual(5);
  });

   it('should show 5 avatars plus 1 additional based on apprentice point level', () => {

      global.localStorage = {
        i2x_token: 'someToken',
        getItem: function () {
          return "{\"points\": 50}"
        }
      };
      const wrapper = mount(<AvatarModal />);
      expect(wrapper.state().imgs.length).toEqual(6);
    });

    it('should show 5 avatars plus 2 additional based on expert point level', () => {

      global.localStorage = {
        i2x_token: 'someToken',
        getItem: function () {
          return "{\"points\": 800}"
        }
      };
      const wrapper = mount(<AvatarModal />);
      expect(wrapper.state().imgs.length).toEqual(7);
    });

    it('should show 5 avatars plus 3 additional based on master point level', () => {

      global.localStorage = {
        i2x_token: 'someToken',
        getItem: function () {
          return "{\"points\": 5000}"
        }
      };
      const wrapper = mount(<AvatarModal />);
      expect(wrapper.state().imgs.length).toEqual(8);
    });


});