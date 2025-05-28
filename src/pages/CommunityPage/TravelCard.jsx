import React from "react";
import styles from "../../css/communitypages/TravelCard.module.css"; // CSS 모듈 import 경로 수정

function TravelCard({ title, tags, author, imageUrl, local }) {
  return (
    <article className={styles.cardArticle}>
      <img
        src={imageUrl}
        alt={title}
        className={styles.cardImage}
      />
      <h2 className={styles.cardTitle}>
        {title}
      </h2>
      <p className={styles.cardTags}>
        #{tags}
      </p>
      <p className={styles.cardTags}>
        #{local}
      </p>
      <p className={styles.cardAuthor}>
        {author}
      </p>
    </article>
  );
}

export default TravelCard;
