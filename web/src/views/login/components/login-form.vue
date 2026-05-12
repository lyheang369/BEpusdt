<template>
  <div>
    <div class="login_form_box">
      <a-form :rules="rules" :model="form" layout="vertical" @submit="onSubmit">
        <a-form-item field="username" :hide-asterisk="true">
          <a-input v-model="form.username" allow-clear placeholder="Enter account">
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item field="password" :hide-asterisk="true">
          <a-input-password v-model="form.password" allow-clear placeholder="Enter password">
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item field="remember">
          <div class="remember">
            <a-checkbox v-model="form.remember">Remember Password</a-checkbox>
            <div class="forgot-password" @click="handleForgotPassword">Forgot Password</div>
          </div>
        </a-form-item>
        <a-form-item>
          <a-button long type="primary" html-type="submit">Login</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserInfoStore } from "@/store/modules/user-info";
import { loginAPI } from "@/api/modules/user/index";

let userStores = useUserInfoStore();
const router = useRouter();

// Remember Password storage key
const REMEMBER_KEY = "login_remember_info";

// simple encryption/decryption functions
const encrypt = (str: string) => {
  return btoa(encodeURIComponent(str));
};

const decrypt = (str: string) => {
  try {
    return decodeURIComponent(atob(str));
  } catch {
    return "";
  }
};

const form = ref({
  username: "",
  password: "",
  verifyCode: null,
  remember: false
});
const rules = ref({
  username: [
    {
      required: true,
      message: "Enter account"
    }
  ],
  password: [
    {
      required: true,
      message: "Enter password"
    }
  ]
});

// read remembered password when component is mounted
onMounted(() => {
  const savedInfo = localStorage.getItem(REMEMBER_KEY);
  if (savedInfo) {
    try {
      const { username, password, remember } = JSON.parse(savedInfo);
      form.value.username = decrypt(username);
      form.value.password = decrypt(password);
      form.value.remember = remember;
    } catch (error) {
      console.error("Failed to read remembered password:", error);
      localStorage.removeItem(REMEMBER_KEY);
    }
  }
});

// submit form
const onSubmit = async ({ errors }: any) => {
  if (errors) return;
  onLogin();
};

// Login
const onLogin = async () => {
  // handle Remember Password
  if (form.value.remember) {
    // save encrypted account and password
    const rememberInfo = {
      username: encrypt(form.value.username),
      password: encrypt(form.value.password),
      remember: true
    };
    localStorage.setItem(REMEMBER_KEY, JSON.stringify(rememberInfo));
  } else {
    // clear storage when Remember Password is disabled
    localStorage.removeItem(REMEMBER_KEY);
  }

  // Login
  let res = await loginAPI(form.value);

  userStores.token = res.data.token;

  // load user information
  await userStores.setAccount();
  // // load route information
  // await routeStore.initSetRouter();

  arcoMessage("success", "Login successful");
  // navigate to Home
  router.replace("/home");
  // set dictionary
  // useSystemStore().setDictData();
};

// Forgot Password
const handleForgotPassword = () => {
  window.open("https://github.com/v03413/BEpusdt", "_blank");
};
</script>

<style lang="scss" scoped>
.login_form_box {
  margin-top: 28px;

  .verifyCode {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .remember {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .forgot-password {
      color: $color-primary;
      cursor: pointer;
    }
  }
}
</style>
