import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import SignupPage from '../Signup';
import {ValidatedInput} from '../Signup';

Enzyme.configure({ adapter: new Adapter() });

/*describe('<DogList /> component', () => {
  it('should render the Dog Cards', () => {
    const wrapper = shallow(<DogList />);
    expect(wrapper.find(DogCard).length).toEqual(5);
  })

  it('should filter dogs on search', () => {
    const wrapper = shallow(<DogList />);
    wrapper.find('input').simulate('change',{target:{value:'Mix'}});
    expect(wrapper.find(DogCard).length).toEqual(2);
  });

  it('should search by the entered term', () => {
    const searchSpy = sinon.spy(DogList.prototype, 'searchDogs'); //spy for search method
    const wrapper = shallow(<DogList />);
    wrapper.find('input').simulate('change',{target:{value:'Mix'}});
    expect(searchSpy.getCall(0).args[0]).toEqual('Mix');
  })
});
*/

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
        const wrapper = shallow(<SignupPage />);
        expect(wrapper.find('button').props().disabled).toEqual(true);
    });

    it('should show error when passwords do not match', () => {
        const wrapper = mount(<SignupPage />);
        console.log(wrapper.find('input').at(1));
        wrapper.find('input').at(1).simulate('change', {target:{value: 'test'}});
        wrapper.find('input').at(2).simulate('change', {target:{value: 'test2'}});
        expect(wrapper.find('.help-block').text()).toEqual("Passwords need to be the same");
    });

    it('should show error when username exists', () => {

    });

    it('should show error when special characters are used for username', () => {

    });

    it('should show error when password is less than 6 characters', () => {

    });

});