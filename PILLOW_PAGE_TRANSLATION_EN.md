# Pillow Page - English Translation

## Purpose
This document contains the complete English translation for the Pillow product page, prepared for registration via the Shopify translationsRegister GraphQL mutation.

## Page Details
- **Resource ID**: gid://shopify/Page/714870391114
- **Locale**: English (en)
- **Original Locale**: French (fr)

## Translations to Register

### 1. Title Translation
- **Key**: title
- **Value**: "Pillow"
- **Digest**: 01ca010f2db47f0191983ef67c2249de77039a40f98d1fd1c7668cd8cc77ef04

### 2. Handle Translation
- **Key**: handle
- **Value**: "pillow"
- **Digest**: 6fbe57ac1100e3b7aae2918122df5d624b96759ef01ae53130f948121de075a3

### 3. Body HTML Translation
- **Key**: body_html
- **Digest**: 786444ff7361264621e581a6ee22c6a7f1140e69054825afdd23f8821f27c161

## Content Sections Included

1. **Header** - BabyComfort branding with English subtitle
2. **Hero Section** - "Protect Your Baby's Head Shape" with marketing copy
3. **Problems Section** - 4 problem cards addressing plagiocephaly concerns
4. **Features Section** - 8 key benefits in English
5. **Pricing Section** - "Special Launch Offer" with USD pricing
6. **Testimonials** - 4 customer reviews in English
7. **FAQ Section** - 4 frequently asked questions
8. **Call-to-Action** - Final promotional section
9. **Footer** - Copyright and company tagline

## GraphQL Mutation

The translationsRegister mutation to register these translations:

```graphql
mutation registerTranslations($input: TranslationsRegisterInput!) {
  translationsRegister(input: $input) {
    translations {
      key
      locale
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

## Next Steps

1. Execute the translationsRegister mutation with the prepared variables
2. Translate the "Your Privacy Choices" page (gid://shopify/Page/714876617034)
3. Translate shop-level elements (menu, footer, general site strings) if accessible
4. Configure language selector (FR/EN) display on the Shopify store
5. Test the complete site in English across all markets (USA, Canada, UK, Australia)

## Status
✅ English translation prepared and validated
⏳ Awaiting execution of translationsRegister mutation
