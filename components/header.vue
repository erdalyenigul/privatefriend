<template>
  <header>
      <div class="headLeft">
        <nuxt-link v-if="!loggedIn" to="/" class="logo">Friend For Find</nuxt-link>
        <nuxt-link v-if="loggedIn" :to="{ name: 'users-list' }" class="logo">Friend For Find</nuxt-link>
      </div>
      <div class="headRightWelcome" v-if="showHeadBtns && !loggedIn">
        <button v-if="!loggedIn" class="button loginBtn" @click="$router.push('/')">Giriş</button>
        <button v-if="!loggedIn" class="button registerBtn" @click="$router.push('/register')">Kayıt ol</button>
      </div>
      <div class="headRight" v-if="showHeadBtns && loggedIn">
        <div class="headLinks">
          <a @click="$router.push('/users/list')"><font-awesome-icon icon="caret-right" /> Ana sayfa</a>
          <a @click="$router.push('/account/profile')"><font-awesome-icon icon="caret-right" /> Profilim</a>
          <a @click="$router.push('/account/myMessages')"><font-awesome-icon icon="caret-right" /> Mesajlar <span class="notifyCounter" v-if="notificationList.length > 0">{{ notificationList.length }} yeni</span></a>
          <a @click="$router.push('/account/photos')"><font-awesome-icon icon="caret-right" /> Fotoğraflar</a>
          <a @click="logout"><font-awesome-icon icon="caret-right" /> Çıkış</a>
        </div>
        <div class="headAccount">
          <a @click="$router.push('/account/profile')">
            <span class="accountFullName">{{ account.name }} {{ account.surname }}</span>
            <span class="accountPP">
              <img v-if="account.pPhoto" :src="account.pPhoto" :alt="account.name">
              <img v-if="!account.pPhoto" src="@/assets/images/ppPlaceholder.jpg">
            </span>
          </a>
        </div>

        <a class="newMessageIcon" v-if="notificationList.length > 0" @click="$router.push('/account/myMessages')">
          <font-awesome-icon icon="comment-dots" />
          <span class="counter">{{ notificationList.length }}</span>
        </a>
        <a class="sideMenuOpenBtn" @click="sideMenuShow = true"><font-awesome-icon icon="bars" /></a>
        <div class="sideMenu" v-if="sideMenuShow">
          <a class="sideMenuCloseBtn" @click="sideMenuShow = false"><font-awesome-icon icon="times" /></a>
          <div class="sideMenuContent">
            <ul>
              <li class="accountInfo">
                 <a @click="$router.push('/account/profile'), sideMenuShow = false">
                  <img v-if="account.pPhoto" :src="account.pPhoto" :alt="account.name">
                  <img v-if="!account.pPhoto" src="@/assets/images/ppPlaceholder.jpg" :alt="account.name">
                  <span>{{ account.name }} {{ account.surname }}</span>
                </a>
              </li>
              <li><button class="button primaryBtn" @click="$router.push('/users/list'), sideMenuShow = false"><font-awesome-icon icon="caret-right" /> Ana sayfa</button></li>
              <li><button class="button primaryBtn" @click="$router.push('/account/profile'), sideMenuShow = false"><font-awesome-icon icon="caret-right" /> Profilim</button></li>
              <li class="messageInfo"><button class="button primaryBtn" @click="$router.push('/account/myMessages'), sideMenuShow = false"><font-awesome-icon icon="caret-right" /> Mesajlar <span class="notifyCounter" v-if="notificationList.length > 0">{{ notificationList.length }} yeni</span></button></li>
              <li><button class="button primaryBtn" @click="$router.push('/account/photos'), sideMenuShow = false"><font-awesome-icon icon="caret-right" /> Fotoğraflar</button></li>
              <li><button class="button primaryBtn" @click="logout"><font-awesome-icon icon="caret-right" /> Çıkış</button></li>
            </ul>
          </div>
          <div class="sideMenuOverlay" @click="sideMenuShow = false"></div>
        </div>
      </div>
    </header>
</template>

<script>
import firebase from 'firebase/app';
import Cookies from "js-cookie";

export default {
  data() {
    return {
      loggedIn: false,
      showHeadBtns: false,
      sideMenuShow: false,
      userId: '',
      account: [],
      notificationList: [],
    }
  },
  async asyncData({ req, redirect, context }) {
    if (process.server) {
     var user = await getUserFromCookie(req);
      if (!user) {
        redirect("/");
      } else {       
        redirect('/account/profile');
      }
    }
  },
  created() {
    this.setUser();
  },
  watch: {
    $route() {
      this.sideMenuShow = false;
    }
  },
  methods: {
    logout() {
      firebase.auth().signOut().then(() => {
        Cookies.remove("access_token");
        localStorage.clear();
        this.loggedIn = false;
        this.$router.push("/");
      });
    },
    async setUser() {
      let self = this;

      await firebase.auth().onAuthStateChanged(user => {
        if (user) {
          self.userId = user.uid;
          firebase.auth().currentUser.getIdToken(true)
          .then(token => {
            Cookies.set("access_token", token);
          });
          firebase.firestore().collection("profiles").where("uid", "==", self.userId)
          .onSnapshot((querySnapshot) => {
            querySnapshot.forEach(doc => {
              self.account = doc.data().account;
              self.notificationList = doc.data().notificationList;
            });
          });
          this.loggedIn = true;
          this.showHeadBtns = true;
        } else {
          this.loggedIn = false;
          this.showHeadBtns = true;
          Cookies.remove("access_token");
        }
      });      
    }
  },
}
</script>