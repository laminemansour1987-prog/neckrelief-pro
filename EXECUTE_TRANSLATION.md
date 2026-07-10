# Execute Pillow Page Translation

## To register the English translation for the Pillow page, execute this mutation:

### GraphQL Query

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

### Variables

```json
{
  "input": {
    "resourceId": "gid://shopify/Page/714870391114",
    "translations": [
      {
        "locale": "en",
        "key": "title",
        "value": "Pillow",
        "digest": "01ca010f2db47f0191983ef67c2249de77039a40f98d1fd1c7668cd8cc77ef04"
      },
      {
        "locale": "en",
        "key": "handle",
        "value": "pillow",
        "digest": "6fbe57ac1100e3b7aae2918122df5d624b96759ef01ae53130f948121de075a3"
      },
      {
        "locale": "en",
        "key": "body_html",
        "value": "<header><h1>BabyComfort</h1><p>Your Baby's Health and Wellness</p></header><section class=\"hero\"><h2>Protect Your Baby's Head Shape</h2><p>Premium ergonomic pillows designed for safe infant sleep and healthy head development</p><button>Shop Now</button></section><section class=\"problems\"><h2>Do You Know About Plagiocephaly?</h2><div class=\"problem-card\"><h3>Flat Head Syndrome</h3><p>Extended pressure on the back of the head can cause flattening or asymmetry. Our ergonomic pillow supports natural head shape development.</p></div><div class=\"problem-card\"><h3>Sleep Discomfort</h3><p>Poor pillow support can lead to restless sleep and potential neck strain. BabyComfort pillows cradle your baby's head for deeper, more comfortable sleep.</p></div><div class=\"problem-card\"><h3>Temperature Regulation</h3><p>Improper bedding can cause overheating, a risk factor for SIDS. Our breathable materials maintain optimal temperature for safe sleep.</p></div><div class=\"problem-card\"><h3>Developmental Concerns</h3><p>Proper head and neck support is crucial for healthy motor development. Our pillows promote correct spinal alignment from birth.</p></div></section><section class=\"features\"><h2>Why Choose BabyComfort?</h2><ul><li><strong>✓ Tested Safety</strong> - Hypoallergenic materials certified for newborns</li><li><strong>✓ Ergonomic Design</strong> - Prevents plagiocephaly with optimal support</li><li><strong>✓ Comfortable</strong> - Soft and enveloping for restful sleep</li><li><strong>✓ Premium Quality</strong> - Durable construction built to last through multiple children</li><li><strong>✓ Easy Maintenance</strong> - Machine washable cover, hypoallergenic fill</li><li><strong>✓ Breathable Fabric</strong> - Reduces overheating risk and improves airflow</li><li><strong>✓ Perfect Size</strong> - Designed specifically for infant proportions</li><li><strong>✓ Pediatrician Approved</strong> - Recommended by leading child development specialists</li></ul></section><section class=\"pricing\"><h2>Special Launch Offer</h2><div class=\"price-info\"><p>Regular Price: $89.99</p><p class=\"offer\">Launch Price: $59.99</p><p class=\"promo\">Use code URGENT25 for additional 25% off</p><button>Order Now - Only $44.99</button></div></section><section class=\"testimonials\"><h2>Trusted by Parents Worldwide</h2><div class=\"testimonial\"><p>\"My daughter sleeps so much better with the BabyComfort pillow. We noticed improvement in her head shape within weeks!\"</p><p>- Sarah M., Montreal</p></div><div class=\"testimonial\"><p>\"Best purchase we made for our son's nursery. The quality is outstanding and the price is reasonable.\"</p><p>- Jean-Paul D., Quebec City</p></div><div class=\"testimonial\"><p>\"Highly recommend to all new parents. This pillow gives me peace of mind about my baby's safety and development.\"</p><p>- Marie L., Toronto</p></div><div class=\"testimonial\"><p>\"Changed our sleep routine completely. Our baby is more comfortable and we can see the benefits already.\"</p><p>- Antoine B., Montreal</p></div></section><section class=\"faq\"><h2>Frequently Asked Questions</h2><div class=\"faq-item\"><h3>Is the pillow safe for newborns?</h3><p>Yes. Our pillow is designed and tested specifically for infants from 0-36 months. All materials are hypoallergenic and meet international safety standards for baby products.</p></div><div class=\"faq-item\"><h3>How do I clean the pillow?</h3><p>The cover is machine washable at 30°C. The inner fill should be hand-washed or spot-cleaned. We recommend cleaning weekly to maintain hygiene and durability.</p></div><div class=\"faq-item\"><h3>What is plagiocephaly prevention?</h3><p>Plagiocephaly (flat head syndrome) can be prevented through proper head positioning and support. Our ergonomic design encourages natural head shape development by distributing pressure evenly.</p></div><div class=\"faq-item\"><h3>Does BabyComfort offer returns?</h3><p>Yes, we offer a 60-day money-back guarantee. If you're not completely satisfied, return the pillow for a full refund, no questions asked.</p></div></section><section class=\"cta\"><h2>Give Your Baby the Best Start</h2><p>Join thousands of happy parents who trust BabyComfort for their little ones' comfort and development.</p><button>Shop Premium Pillows Today</button></section><footer><p>&copy; 2024 BabyComfort. All rights reserved.</p><p>Your Baby's Health and Wellness is Our Priority</p></footer>",
        "digest": "786444ff7361264621e581a6ee22c6a7f1140e69054825afdd23f8821f27c161"
      }
    ]
  }
}
```

## Expected Response

On successful execution, the API should return:

```json
{
  "data": {
    "translationsRegister": {
      "translations": [
        {
          "key": "title",
          "locale": "en",
          "value": "Pillow"
        },
        {
          "key": "handle",
          "locale": "en",
          "value": "pillow"
        },
        {
          "key": "body_html",
          "locale": "en",
          "value": "[Complete HTML content]"
        }
      ],
      "userErrors": []
    }
  }
}
```

## Execution Method

This mutation can be executed through:
1. **Shopify Admin GraphQL API** - Using authenticated requests
2. **Shopify CLI** - If available in development environment
3. **Shopify Apps** - Custom app with Admin API access

Once executed successfully, the English version of the Pillow page will be available in the store when English language is selected.
