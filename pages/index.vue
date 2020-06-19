<template>
  <div class="welcome">
    <div class="welcomeLine">
      <span>ÜCRETSİZ YEPYENİ BİR <br> ARKADAŞLIK SİSTEMİ</span>
      <span>Yeni arkadaşlıklar kurmaya hazır mısın?</span>
    </div>
    <div class="welcomeForm">
      <div class="formHead">
        <font-awesome-icon icon="sign-in-alt" /> <h1>Sisteme giriş</h1>
      </div>
      <form @submit.prevent="login">
        <span class="formW100"><input type="email" placeholder="E-posta" v-model="email" /></span>
        <span class="formW100"><input type="password" placeholder="Şifre" v-model="password" /></span>
        <div v-if="errorShow" class="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="button primaryBtn">GİRİŞ YAP</button>
      </form>
    </div>
    <div class="welcomeBottom">
      <span>Üye değil misiniz? <br>Üye olun ve yeni arkadaşlıklar kurun.</span>
      <button class="button bottomBtn" @click="$router.push('/register')">HEMEN ÜCRETSİZ ÜYE OL</button>
    </div>
    <div class="overlayBg"></div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import { getUserFromCookie, getUserFromSession } from "@/helpers";

export default {
  data() {
    return {
      email: "",
      password: "",
      errorShow: false,
      errorMsg: "",
      userId: ""
    };
  },
  asyncData({ req, redirect, route }) {
    if (process.server) {
      const user = getUserFromCookie(req);
      if (!user) {
        redirect("/");
      } else {
        redirect("/users/list");
      }
    }
  },
  methods: {
    login() {
      let self = this;
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
      .then(userData => {
        localStorage.setItem('uid' , userData.user.uid);
        self.$router.push('/account/profile');
      })
      .catch(function(error) {
        self.errorShow = true;
        self.errorMsg = error.message;
      });
    }
  }
};
</script>

