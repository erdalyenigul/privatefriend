<template>
  <div class="container">
    <div v-if="setData" class="chatWithWho">
      <div class="headline"><font-awesome-icon icon="comment-dots" /> Mesaj kutusu</div>
      <div class="chatCard" v-for="(person, index) in chatWithWho" :key="index">
        <nuxt-link :to="{ name: 'users-messages-message', params: { message: person.friendId} }">
          <div class="ccImg"><img class="ccImg" :src="person.pPhoto" alt=""></div>
          <div class="ccInfo">
            <span>{{ person.name }} {{ person.surname }}</span>
            <button class="button primaryBtn">Mesaj gönder</button>
          </div>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import { getUserFromCookie, getUserFromSession } from "@/helpers";

export default {
  data() {
    return {
      setData: false,
      chatList: [],
      chatWithWho: [],
    }
  },
  asyncData({ req, redirect, route }) {
    if (process.server) {
      var user = getUserFromCookie(req);
      if (!user) {
        redirect("/");
      } else {        
        
      }
      return {user: user}
    }
  },
  mounted() {
    this.userGetAccount();
  },
  methods: {
    async userGetAccount(){
      let self = this;
      await firebase.auth().onAuthStateChanged(user => {
        if (user) {
          if(user.uid == localStorage.getItem('uid')) {
            this.admin = true;
          } else {
            console.log('!admin')
          }
          if(user.emailVerified) {
            this.email_verified = false;
            firebase.firestore().collection("profiles").where("uid", "==", user.uid).get()
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                self.chatList = doc.data().chatList;
              });

              for(var i = 0; i < self.chatList.length; i++) {
                firebase.firestore().collection("profiles").where("uid", "==", self.chatList[i]).get()
                .then(querySnapshot => {
                  querySnapshot.forEach(doc => {
                    var item = {};
                    item = {};
                    item.name = doc.data().account.name;
                    item.surname = doc.data().account.surname;
                    item.pPhoto = doc.data().account.pPhoto;
                    item.friendId = doc.data().uid;
                    self.chatWithWho.push(item);
                  });
                });
              }
              self.setData = true;
            });

          } else {
            this.email_verified = true;
          }
        }
      });
    },
  }
}
</script>