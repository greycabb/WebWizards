import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

import ProjectPage from '../ProjectPage';

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