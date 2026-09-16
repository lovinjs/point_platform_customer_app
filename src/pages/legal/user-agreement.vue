<template>
  <legal-document :document="userAgreementDocument" />
</template>

<script setup lang="ts">
import LegalDocument from '@/components/legal-document.vue'
import { userAgreementDocument } from '@/config/legal'
</script>
