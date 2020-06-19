<template>
  <div class="container">
    <div v-if="setData" class="usersWrap">
      <div class="headline"><font-awesome-icon icon="user-friends" /> Arkadaş bul</div>
      <div class="userCard" v-for="(user, index) in users" :key="user.uid">
        <nuxt-link :to="{ name: 'users-friendID', params: { friendID: user.uid} }">
          <div class="ucContent">
            <div class="userImage">
              <img :src="user.account.pPhoto" :alt="`${user.account.name} ${user.account.surname}`">
            </div>
            <div class="userInfo">
              <div class="uName">{{ user.account.name }} {{ user.account.surname }}</div>
              <div class="uCity"><strong>Şehir:</strong> {{ user.account.person.city }}</div>
              <div class="uCity"><strong>Yaş:</strong> {{ user.account.person.age }}</div>
            </div>
          </div>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import { getUserFromCookie, getUserFromSession } from "@/helpers";

export default {
  data() {
    return {
      users: [],
      setData: false,
    }
  },
  asyncData({ req, redirect }) {
    if (process.server) {
      var user = getUserFromCookie(req);
      if (!user) {
        redirect("/");
      } else {        
        
      }
    }    
  },
  created() {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        this.$router.push('/')
      } else {
        this.getUsers();
      }
    })
  },
  methods: {
    async getUsers(){
      let self = this;
      await firebase.firestore().collection("profiles").orderBy("uid", "desc").get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          self.users.push(doc.data())
        });
        self.setData = true;
      });
    },
  }
}
</script>