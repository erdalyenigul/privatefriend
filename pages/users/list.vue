<template>
  <div class="container">
    <div v-if="setData" class="usersWrap">
      <div class="headline"><font-awesome-icon icon="user-friends" /> Ana sayfa</div>
      <div class="userCard" v-for="(user, index) in users" :key="user.uid" v-if="author.uid != user.uid">
        <nuxt-link :to="{ name: 'users-friendID', params: { friendID: user.uid} }">
          <div class="ucContent">
            <div class="userImage">
              <img v-if="user.account.pPhoto" :src="user.account.pPhoto" :alt="`${user.account.name} ${user.account.surname}`">
              <img v-if="!user.account.pPhoto" src="@/assets/images/ppPlaceholder.jpg">
            </div>
            <div class="userInfo">
              <div class="uName">{{ user.account.name }} {{ user.account.surname }}</div>
              <div class="uCity"><strong>Şehir:</strong> {{ user.account.person.city }}</div>
              <div v-if="user.account.person.age" class="uCity"><strong>Yaş:</strong> {{ user.account.person.age }}</div>
              <div v-if="!user.account.person.age" class="uCity"><strong>Yaş:</strong> - </div>
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
      author: [],
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
      this.author = user;
      if (!user) {
        this.$router.push('/')
      } else {
        this.getUsers();
      }
    })
  },
  methods: {
    async getUsers(){
      console.log(this.author.uid)
      let self = this;
      await firebase.firestore().collection("profiles").orderBy("uid", "desc").get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          self.users.push(doc.data())
        });
        console.log(self.users)
        self.setData = true;
      });
    },
  }
}
</script>