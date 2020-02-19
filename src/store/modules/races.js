/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign, no-return-assign */

import { RepositoryFactory } from '../../repositories/RepositoryFactory';
const CurrentRepository = RepositoryFactory.get('current');

const state = {
  races: '',
  raceResult: '', // TODO make this an array to hold all results. Currently being overwritten with each mutation, so fetchRoundResults has to be called lots!
};

const getters = {
  allRaces: state => state.races,
  racesCount: state => state.races.length,
  raceDates: state => state.races.map(race => race.date),
  allResults: state => state.results,
  lapNumber: state => state.results.Results[0].laps,
};

const mutations = {
  set_races: (state, races) => (state.races = races),
  set_round_result: (state, raceResult) => (state.result = raceResult),
};

const actions = {
  async fetchRaces({ commit }) {
    try {
      const response = await CurrentRepository.get();
      const currentRaces = response.data.MRData.RaceTable.Races;
      console.log(currentRaces);
      commit('set_races', currentRaces);
    } catch (e) {
      console.log(e);
    }
  },

  // TODO refactor this bad boi, possibly commit response and use roundInfo in a getter (need to check what roundInfo actually is)?
  async fetchSingleRoundResults({ commit }, round) {
    try {
      const response = await CurrentRepository.getSingleRoundResults(round);
      const roundInfo = response.data.MRData.RaceTable.Races[0]; // get specifically RaceTable info
      await commit('set_round_result', roundInfo);
      return response;
    } catch (e) {
      console.log(e);
    }
  },
  // http://ergast.com/api/f1/current/results.json - can be used to access ALL races in season's results!!

  async fetchAllRoundsResults({ commit }) {
    try {
      const response = await CurrentRepository.getAllRoundsResults();
      const races = response.data.MRData.RaceTable.Races[0]; // get specifically RaceTable info
      await commit('set_race_results', races);
      return response;
    } catch (e) {
      console.log(e);
    }
    // http://ergast.com/api/f1/current/results.json - can be used to access ALL races in season's results!!
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
