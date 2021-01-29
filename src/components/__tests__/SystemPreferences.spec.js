import { mount } from '@vue/test-utils'
import SystemPreferences from '../SystemPreferences.vue'

function createWrappedPage(props) {
  return mount(SystemPreferences, { propsData: props });
}

const baseProps = {
  memoryInGB: 4,
  numberCPUs: 5,
  availMemoryInGB: 8,
  availNumCPUs: 6,
  noChangesToApply: false,
};

describe('SystemPreferences.vue', () => {

  it("accepts valid data", async () => {
    const wrapper = createWrappedPage(baseProps);

    expect(wrapper.props().memoryInGB).toBe(4);
    expect(wrapper.props().numberCPUs).toBe(5);
    expect(wrapper.props().availMemoryInGB).toBe(8);
    expect(wrapper.props().availNumCPUs).toBe(6);

    let slider1 =  wrapper.find("div#memoryInGBWrapper div.vue-slider.vue-slider-disabled");
    expect(slider1.exists()).toBeFalsy();
    let slider2 =  wrapper.find("div#numCPUWrapper div.vue-slider.vue-slider-disabled");
    expect(slider2.exists()).toBeFalsy();

    let div1 =  wrapper.find("div#memoryInGBWrapper");
    let span1 = div1.find("div.vue-slider div.vue-slider-dot");
    expect(span1.exists()).toBeTruthy();
    expect(span1.attributes("aria-valuemin")).toEqual('2');
    expect(span1.attributes("aria-valuenow")).toEqual('4');
    expect(span1.attributes("aria-valuemax")).toEqual('8');

    let div2 =  wrapper.find("div#numCPUWrapper");
    let span2 = div2.find("div.vue-slider div.vue-slider-dot");
    expect(span2.exists()).toBeTruthy();
    expect(span2.attributes("aria-valuemin")).toEqual('1');
    expect(span2.attributes("aria-valuenow")).toEqual('5');
    expect(span2.attributes("aria-valuemax")).toEqual('6');

    const applyChangesButton = wrapper.find("button#applyPreferenceChanges");
    expect(applyChangesButton.exists()).toBeTruthy();
    expect(applyChangesButton.attributes("disabled")).toBeFalsy();
  });

  it("sets correct defaults and is enabled", () => {
    let minimalProps = Object.assign({}, baseProps);
    delete minimalProps.memoryInGB;
    delete minimalProps.numberCPUs;
    delete minimalProps.noChangesToApply;
    const wrapper = createWrappedPage(minimalProps);
    expect(wrapper.props().memoryInGB).toBe(2);
    expect(wrapper.props().numberCPUs).toBe(2);
    let slider1 =  wrapper.find("div#memoryInGBWrapper div.vue-slider.vue-slider-disabled");
    expect(slider1.exists()).toBeFalsy();
    let slider2 =  wrapper.find("div#numCPUWrapper div.vue-slider.vue-slider-disabled");
    expect(slider2.exists()).toBeFalsy();

    let div1 =  wrapper.find("div#memoryInGBWrapper");
    let span1 = div1.find("div.vue-slider div.vue-slider-dot");
    expect(span1.exists()).toBe(true);
    expect(span1.attributes("aria-valuemin")).toEqual('2');
    expect(span1.attributes("aria-valuenow")).toEqual('2');
    expect(span1.attributes("aria-valuemax")).toEqual('8');

    let div2 =  wrapper.find("div#numCPUWrapper");
    let span2 = div2.find("div.vue-slider div.vue-slider-dot");
    expect(span2.exists()).toBe(true);
    expect(span2.attributes("aria-valuemin")).toEqual('1');
    expect(span2.attributes("aria-valuenow")).toEqual('2');
    expect(span2.attributes("aria-valuemax")).toEqual('6');

    const applyChangesButton = wrapper.find("button#applyPreferenceChanges");
    expect(applyChangesButton.exists()).toBeTruthy();
    expect(applyChangesButton.attributes("disabled")).toBeFalsy();
  })

  // Note that k8s.vue should adjust these values so we don't see this
  it("disables widgets when no options are possible", () => {
    let minimalProps = {
      memoryInGB: 4,
      numberCPUs: 1,
      availMemoryInGB: 2,
      availNumCPUs: 1
    };
    const wrapper = createWrappedPage(minimalProps);
    let slider1 =  wrapper.find("div#memoryInGBWrapper div.vue-slider.vue-slider-disabled");
    expect(slider1.exists()).toBeTruthy();
    expect(slider1.find("div.vue-slider-rail div.vue-slider-dot.vue-slider-dot-disabled").exists()).toBeTruthy();

    let slider2 =  wrapper.find("div#numCPUWrapper div.vue-slider.vue-slider-disabled");
    expect(slider2.exists()).toBeTruthy();
    expect(slider2.find("div.vue-slider-rail div.vue-slider-dot.vue-slider-dot-disabled").exists()).toBeTruthy();
  })

  it("disables the apply-changes button when there are no changes", () => {
    let props = Object.assign({}, baseProps);
    props.noChangesToApply = true;
    const wrapper = createWrappedPage(props);

    const applyChangesButton = wrapper.find("button#applyPreferenceChanges");
    expect(applyChangesButton.exists()).toBeTruthy();
    expect(applyChangesButton.attributes("disabled")).toBeTruthy();
  })

  it("the sliders detect invalid values", async () => {
    const wrapper = createWrappedPage(baseProps);

    let div1 =  wrapper.find("div#memoryInGBWrapper");
    let slider1 =  div1.find("div.vue-slider");
    let span1 = slider1.find("div.vue-slider-dot");
    let slider1vm =  slider1.vm;

    for (let i = 2; i <= baseProps.availMemoryInGB; i++) {
      await slider1vm.setValue(i);
      expect(span1.attributes("aria-valuenow")).toEqual(i.toString());
      expect(slider1vm.getValue()).toBe(i);
    }

    const setUndersizeMemoryValueFunc = () => {
      slider1vm.setValue(1);
    };
    expect(setUndersizeMemoryValueFunc).toThrowError('The "value" must be greater than or equal to the "min"');

    const setOversizeMemoryValueFunc = () => {
      slider1vm.setValue(baseProps.availMemoryInGB + 1);
    };
    expect(setOversizeMemoryValueFunc).toThrowError('The "value" must be less than or equal to the "max"');

    let div2 =  wrapper.find("div#numCPUWrapper");
    let slider2 =  div2.find("div.vue-slider");
    let slider2vm =  slider2.vm;
    let span2 = slider2.find("div.vue-slider-dot");

    for (let i = 1; i <= baseProps.availNumCPUs; i++) {
      await slider2vm.setValue(i);
      expect(span2.attributes("aria-valuenow")).toEqual(i.toString());
      expect(slider2vm.getValue()).toBe(i);
    }

    const setUndersizeCPUValueFunc = () => {
      slider2vm.setValue(0);
    };
    expect(setUndersizeCPUValueFunc).toThrowError('The "value" must be greater than or equal to the "min"');

    const setOversizeCPUValueFunc = () => {
      slider2vm.setValue(baseProps.availNumCPUs + 1);
    };
    expect(setOversizeCPUValueFunc).toThrowError('The "value" must be less than or equal to the "max"');
  });

  it("emits events", async () => {
    const wrapper = createWrappedPage(baseProps);

    let div1 = wrapper.find("div#memoryInGBWrapper");
    let slider1 = div1.find("div.vue-slider");
    let slider1vm = slider1.vm;

    await slider1vm.setValue(3);
    let updateMemoryEmitter =  wrapper.emitted().updateMemory;
    expect(updateMemoryEmitter).toBeTruthy();
    expect(updateMemoryEmitter.length).toBe(1);
    expect(updateMemoryEmitter[0]).toEqual([3]);
    await slider1vm.setValue(5);
    expect(updateMemoryEmitter.length).toBe(2);
    expect(updateMemoryEmitter[0]).toEqual([3]);
    expect(updateMemoryEmitter[1]).toEqual([5]);

    let div2 =  wrapper.find("div#numCPUWrapper");
    let slider2 =  div2.find("div.vue-slider");
    let slider2vm =  slider2.vm;
    await slider2vm.setValue(2);
    let updateCPUEmitter =  wrapper.emitted().updateCPU;
    expect(updateCPUEmitter).toBeTruthy();
    expect(updateCPUEmitter.length).toBe(1);
    expect(updateCPUEmitter[0]).toEqual([2]);
    await slider2vm.setValue(4);
    expect(updateCPUEmitter.length).toBe(2);
    expect(updateCPUEmitter[0]).toEqual([2]);
    expect(updateCPUEmitter[1]).toEqual([4]);

    let updateButton = wrapper.find("button#applyPreferenceChanges");
    expect(updateButton.exists()).toBeTruthy();
    await updateButton.trigger('click');
    let applyChangesEmitter = wrapper.emitted().applySystemPreferenceChanges;
    expect(applyChangesEmitter).toBeTruthy();
    expect(applyChangesEmitter.length).toBe(1);
    expect(applyChangesEmitter[0].length).toEqual(0);

  });

  it("doesn't emit events when disabled", async () => {
    let props = Object.assign({}, baseProps);
    props.noChangesToApply = true;
    const wrapper = createWrappedPage(props);

    let updateButton = wrapper.find("button#applyPreferenceChanges");
    await updateButton.trigger('click');
    let applyChangesEmitter = wrapper.emitted().applySystemPreferenceChanges;
    expect(applyChangesEmitter).toBeFalsy();
  });

})
