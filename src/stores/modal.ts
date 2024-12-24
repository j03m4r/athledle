import { defineStore } from 'pinia'
import { ref } from 'vue';

/*
  * Pinia store for global control over modal
  * */
export const useModalStore = defineStore('modal', () => {
  const isOpen = ref<boolean>(false);
  const result = ref<string>("");

  function setOpen(_open: boolean) {
    isOpen.value = _open;
  }

  function setResult(_result: string) {
    result.value = _result;
  }

  return { isOpen, result, setOpen, setResult }
});

