<template>
  <div class="driver-list">
    <div v-for="driver in allDrivers" :key="driver.driverId" class="driver-list__item">
      <router-link :to="'/drivers/' + driver.driverId">
        <p>{{ driver.givenName }} {{ driver.familyName }}</p>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
// eslint-disable-next-line no-unused-vars
import styles from '../styles/styles.scss';

export default {
  name: 'Drivers',
  data() {
    return {};
  },

  computed: {
    ...mapGetters(['allDrivers']),
  },

  created() {
    this.fetchDrivers().then(() => (this.loading = false));
  },
  methods: { ...mapActions(['fetchDrivers']) },
};
</script>

<style scoped lang="scss">
.driver-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

  &__item {
    position: relative;
    margin: 2rem;
    padding: 2rem;
    border-radius: 12px;
    background: white;
    @include box_shadow(1);
    a {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      text-decoration: none;
    }
  }
}
</style>
