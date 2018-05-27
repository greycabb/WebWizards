import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';

import ProjectPage from '../ProjectPage';

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

//Test whether a ProjectPage renders correctly
describe('ProjectPage /> component', () => {

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
      const wrapper = mount(<ProjectPage />);
      expect(wrapper.find('button').props().disabled).toEqual(true);
  });
  
});