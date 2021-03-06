<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-slotNumber`"
      label="Slot number"
      hint="Leave the slot number empty if this capability doesn't select a wheel slot, but only activates wheel slot rotation for a WheelSlot capability in another channel."
      style="display: inline-block; margin-bottom: 12px;">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="slotNumber" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-${capability.typeData.speedOrAngle}`">

      <template #label>
        <template v-if="capability.typeData.speedOrAngle === `speed`">
          Speed / <a
            href="#angle"
            class="button secondary inline"
            title="Specify angle instead of speed"
            @click.prevent="changeSpeedOrAngle(`angle`)">Angle</a>
        </template>
        <template v-else>
          Angle / <a
            href="#speed"
            class="button secondary inline"
            title="Specify speed instead of angle"
            @click.prevent="changeSpeedOrAngle(`speed`)">Speed</a>
        </template>
      </template>

      <EditorProportionalPropertySwitcher
        v-if="capability.typeData.speedOrAngle"
        ref="speedOrAngleInput"
        :capability="capability"
        :formstate="formstate"
        :property-name="capability.typeData.speedOrAngle"
        :required="true" />

    </LabeledInput>

    <EditorWheelSlots
      :channel="channel"
      :capability="capability"
      :formstate="formstate" />

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <PropertyInputText
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import EditorProportionalPropertySwitcher from '../EditorProportionalPropertySwitcher.vue';
import EditorWheelSlots from '../EditorWheelSlots.vue';
import LabeledInput from '../../LabeledInput.vue';
import PropertyInputText from '../../PropertyInputText.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
    EditorWheelSlots,
    LabeledInput,
    PropertyInputText,
  },
  props: {
    capability: {
      type: Object,
      required: true,
    },
    channel: {
      type: Object,
      required: true,
    },
    formstate: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      properties: schemaProperties,

      /** Used in {@link EditorCapabilityTypeData} */
      defaultData: { // eslint-disable-line vue/no-unused-properties
        slotNumber: ``,
        slotNumberStart: null,
        slotNumberEnd: null,
        speedOrAngle: `speed`,
        speed: ``,
        speedStart: null,
        speedEnd: null,
        angle: ``,
        angleStart: null,
        angleEnd: null,
        comment: ``,
      },
    };
  },
  computed: {
    /**
     * Called from {@link EditorCapabilityTypeData}
     * @returns {Array.<String>} Array of all props to reset to default data when capability is saved.
     */
    resetProps() { // eslint-disable-line vue/no-unused-properties
      const resetProp = this.capability.typeData.speedOrAngle === `speed` ? `angle` : `speed`;

      return [resetProp, `${resetProp}Start`, `${resetProp}End`];
    },
  },
  methods: {
    changeSpeedOrAngle(newValue) {
      this.capability.typeData.speedOrAngle = newValue;
      this.$nextTick(() => this.$refs.speedOrAngleInput.focus());
    },
  },
};
</script>
