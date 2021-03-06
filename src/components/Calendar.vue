<template>
  <div>
    <section class="module calendar-module">
      <div class="module-header">
        <h3 class="module-heading">Race Calendar</h3>
      </div>

      <div class="current-month">
        <div class="arrow-selector" @click="subtractMonth">
          <img
            class="icon-arrow icon-arrow--nav"
            src="../assets/icons/chevron-left-solid.svg"
            alt="chevron-left"
          />
        </div>
        <h4>{{ month + ' - ' + year }}</h4>
        <div class="arrow-selector" @click="addMonth">
          <img
            class="icon-arrow icon-arrow--nav"
            src="../assets/icons/chevron-right-solid.svg"
            alt="chevron-right"
          />
        </div>
      </div>

      <div class="calendar">
        <ol class="weekdays">
          <li v-for="day in days" :key="day.index" class="weekday">{{ day }}</li>
        </ol>

        <ol class="dates">
          <li v-for="dates in firstDayOfMonth" :key="dates.index">&nbsp;</li>
          <li
            v-for="date in daysInMonth"
            :key="date.index"
            :class="{ 'current-day': raceDates.includes(buildDate(date)) }"
            @click="getRaceInfo(buildDate(date))"
          >
            <span>{{ date }}</span>
          </li>
        </ol>

        <modal v-show="isModalVisible" :circuit="raceInfo.circuit" @close="closeModal">
          <template v-slot:header>
            <!-- <p>{{ raceInfo.raceDate }}</p> -->
            <h2 class="title">{{ raceInfo.raceName }}</h2>
            <span class="subtitle"
              >{{ raceInfo.circuit }} <strong>&#8212;</strong> {{ raceInfo.country }}</span
            >
          </template>
          <template v-slot:body>
            <div>
              <img src="../assets/icons/trophy.svg" alt="race winner" />
              <p v-if="raceInfo.winner">
                {{ raceInfo.winner.forename }} <strong>{{ raceInfo.winner.surname }}</strong>
              </p>
            </div>
            <div>
              <img src="../assets/icons/round.svg" alt="round number" />
              <p>
                Round <strong>{{ raceInfo.roundNum }}</strong>
              </p>
            </div>
            <div>
              <img src="../assets/icons/laps.svg" alt="number of laps" />
              <p v-if="raceInfo.laps">
                <strong>{{ raceInfo.laps }}</strong>
                Laps
              </p>
            </div>
          </template>
        </modal>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import modal from '@/components/Modal.vue';
import moment from 'moment';

export default {
  name: 'RaceCalendar',
  components: {
    modal,
  },
  data() {
    return {
      // race vars
      raceInfo: {
        raceDate: '',
        country: '',
        raceName: '',
        circuit: '',
        roundNum: '',
        winner: '',
        laps: '',
      },

      // date vars
      today: moment(),
      dateContext: moment(),
      days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

      // general vars
      isModalVisible: false,
    };
  },

  computed: {
    ...mapGetters(['allRaces', 'raceDates', 'raceOptions']),
    // view items
    year() {
      const t = this;
      return t.dateContext.format('Y');
    },
    month() {
      const t = this;
      return t.dateContext.format('MMMM');
    },

    // work out info for each month
    daysInMonth() {
      const t = this;
      return t.dateContext.daysInMonth();
    },
    currentDate() {
      const t = this;
      return t.dateContext.get('date');
    },
    firstDayOfMonth() {
      const t = this;
      const firstDay = moment(t.dateContext).subtract(t.currentDate - 1, 'days');
      return firstDay.weekday();
    },

    // set init
    initialDate() {
      const t = this;
      return t.today.get('date');
    },
    initialMonth() {
      const t = this;
      return t.today.format('MMMM');
    },
    initialYear() {
      const t = this;
      return t.today.format('Y');
    },
  },

  created() {
    this.fetchRaces();
  },

  methods: {
    ...mapActions(['fetchRaces', 'fetchResults']),
    // date formatters
    prependUnderTen(day) {
      const reformatDay = day < 10 ? `0${day}` : day;
      return reformatDay;
    },

    buildDate(day) {
      // format month to num
      const selMonth = moment()
        .month(this.month)
        .format('MM');
      // format day to include '0' if under 10
      const selDay = this.prependUnderTen(day);
      // build date
      const fullDate = `${this.year}-${selMonth}-${selDay}`;
      return fullDate;
    },

    async getRaceInfo(date) {
      let showModal = false;
      let getCountry = '';
      let getName = '';
      let getCircuit = '';
      let getRound = '';
      let getLaps = '';
      let getWinner = '';
      // iterate through each race to match date of current
      for await (let el of this.allRaces) {
        if (el.date == date) {
          // if date match then give variables values
          getCountry = el.Circuit.Location.country;
          getName = el.raceName;
          getCircuit = el.Circuit.circuitName;
          getRound = el.round;
          await this.$store.dispatch('fetchResults', getRound);
          getLaps = this.raceOptions.laps;
          getWinner = this.raceOptions.winner;
          showModal = true;
        }
      }

      // assign the variables to corresponding data properties
      this.raceInfo.raceDate = date
        .split('-')
        .reverse()
        .join('/');
      this.raceInfo.country = getCountry;
      this.raceInfo.raceName = getName;
      this.raceInfo.circuit = getCircuit;
      this.raceInfo.roundNum = getRound;
      this.raceInfo.laps = getLaps;
      this.raceInfo.winner = getWinner;
      return showModal ? (this.isModalVisible = true) : '';
    },

    // change month view
    addMonth() {
      const t = this;
      t.dateContext = moment(t.dateContext).add(1, 'month');
    },
    subtractMonth() {
      const t = this;
      t.dateContext = moment(t.dateContext).subtract(1, 'month');
    },

    closeModal() {
      this.isModalVisible = false;
    },
  },
};
</script>

<style scoped lang="scss">
.fade-enter {
  opacity: 0;
}
.fade-enter-active {
  transition: opacity 1000ms;
}
.fade-enter-to {
  opacity: 1;
}
.weekdays,
.dates {
  padding: 0;
  display: grid;
  justify-content: space-between;
  align-content: center;
  grid-template-columns: repeat(7, 1fr);
  li {
    list-style-type: none;
  }
}

.calendar {
  margin: 0 2rem 1rem 2rem;
  @media screen and (max-width: 900px) {
    margin: 0 1rem 1rem 1rem;
  }
}

.weekdays {
  position: relative;
  z-index: 1;
  &:before {
    content: '';
    position: absolute;
    left: 5%;
    top: 30px;
    height: 1px;
    width: 90%; /* or 100px */
    border-bottom: 1px solid rgba(221, 226, 229, 0.4);
  }
}

.weekday {
  text-align: center;
}

.dates {
  list-style: none;
  padding: 0 0 2rem 0;
  li {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    @media screen and (max-width: 900px) {
      padding: 0.5rem;
    }
  }
}

.current-month {
  text-align: center;
  display: flex;
  justify-content: space-around;
  padding: 0 2rem 2rem 2rem;
  .arrow-selector {
    cursor: pointer;
  }
  @media screen and (min-width: 750px) {
    justify-content: center;
    .arrow-selector {
      padding: 0 2rem;
    }
  }
  align-content: center;
  color: $gray4;

  h4 {
    margin: 0;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 1px;
    color: $gray4;
    min-width: 180px;
  }
}

.current-day {
  position: relative;
  z-index: 1;
  color: white;
  cursor: pointer;
  &::before {
    @include box_shadow(2);
    content: '';
    position: absolute;
    height: 30px;
    width: 30px;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    border-radius: 50%;
    background: linear-gradient(-160deg, #00d2ff 0%, #3a47d5 100%);
    z-index: -1;
    @media screen and (min-width: 750px) {
      height: 40px;
      width: 40px;
    }
  }
}

/* modal */

.modal-header {
  h2.title {
    color: $primary-color;
    font-size: 2.5rem;
    line-height: 1;
    margin: 0;
    text-align: left;
    @media screen and (min-width: 768px) {
      line-height: 1.2;
    }
  }
  .subtitle {
    display: inline-block;
    font-weight: 400;
    font-size: 0.875rem;
    margin-bottom: 2rem;
    @media screen and (min-width: 768px) {
      font-size: 1rem;
    }
  }
}
.modal-body {
  div {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }
  p {
    margin: 0.5rem 0;
  }
  img {
    background-color: #9da5ff;
    border-radius: 15%;
    text-align: center;
    line-height: 100px;
    vertical-align: middle;
    margin-right: 0.7rem;
    height: 24px;
    width: 24px;
    -webkit-box-sizing: content-box;
    box-sizing: content-box;
    padding: 8px;
  }
}
</style>
