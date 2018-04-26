package org.t2k.cgs.utils;

import org.apache.log4j.Logger;

import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class GeneralUtils {

    private static final Logger LOGGER = Logger.getLogger(GeneralUtils.class);

    /**
     * Method to obtain the structure of a Java class as a json.
     * <p>
     * The returned string contains the fields of the class and their annotations.
     * <p>
     * WARNING: This method is used to trigger certain processes of the application! Changing it may start unwanted
     * processes. Handle it with care.
     * <p>
     * NOTE: This method uses reflection to get the fields of the class recursively
     */
    public static String getClassStructure(Class aClass) throws IOException {
        @SuppressWarnings("StringBufferReplaceableByString")
        StringBuilder classContents = new StringBuilder("{");
        classContents
                .append("\"type\":\"").append(aClass.getName()).append("\"")
                .append(", \"annotations\":[")
                .append(getAnnotations(aClass))
                .append("], ");

        classContents.append("\"fields\":{")
                .append(getClassFields(aClass))
                .append("}");
        classContents.append("}");
        return classContents.toString();
    }

    private static String getClassFields(Class aClass) throws IOException {
        StringBuilder classContents = new StringBuilder();
        java.lang.reflect.Field[] fields = aClass.getDeclaredFields();
        for (int i = 0; i < fields.length; i++) {
            java.lang.reflect.Field field = fields[i];
            classContents
                    .append("\"")
                    .append(field.getName())
                    .append("\" :{\"type\":\"")
                    .append(field.getGenericType().getTypeName());

            classContents.append("\", \"annotations\":[");
            classContents.append(getAnnotations(field));
            classContents.append("]");

            if (aClass != field.getType()
                    && field.getType().getName().toLowerCase().startsWith("org.t2k")) { // only treat t2k classes
                classContents.append(", \"fields\":");
                classContents.append(getClassStructure(field.getType()));
            }

            if (field.getGenericType() instanceof ParameterizedType) {
                Class fieldClass = ((Class) ((ParameterizedType) field.getGenericType()).getActualTypeArguments()[0]);
                classContents.append(", \"genericType\":{\"");
                classContents.append(fieldClass.getName());
                classContents.append("\":");
                classContents.append(getClassStructure(fieldClass));
                classContents.append("}");
            }

            classContents.append("}");
            if (i < fields.length - 1) {
                classContents.append(", ");
            }
        }
        return classContents.toString();
    }

    private static String getAnnotations(AnnotatedElement annotatedElement) {
        StringBuilder classContents = new StringBuilder();
        Annotation[] annotations = annotatedElement.getAnnotations();
        for (int j = 0; j < annotations.length; j++) {
            Annotation annotation = annotations[j];
            classContents
                    .append("{\"name\":\"")
                    .append(annotation.annotationType().getName());

            try {
                classContents.append("\", \"params\":")
                        .append(getAnnotationParamsWithValues(annotation));
            } catch (InvocationTargetException | IllegalAccessException e) {
                LOGGER.error("Error extracting parameters from annotation: " + annotation.annotationType().getName());
            }

            classContents.append("}");
            if (j < annotations.length - 1) {
                classContents.append(", ");
            }
        }
        return classContents.toString();
    }

    private static String getAnnotationParamsWithValues(Annotation annotation) throws InvocationTargetException, IllegalAccessException {
        List<Method> methods = Arrays.asList(annotation.annotationType().getDeclaredMethods());
        methods.sort(Comparator.comparing(Method::getName));
        StringBuilder methodsStringBuilder = new StringBuilder("[");
        for (int i = 0; i < methods.size(); i++) {
            Method method = methods.get(i);
            method.setAccessible(true);
            Object methodValue = method.invoke(annotation);

            if (methodValue == null
                    || (!(methodValue instanceof Enum)
                    && !Arrays.stream(methodValue.getClass().getDeclaredMethods())
                    .map(Method::getName)
                    .collect(Collectors.toList()).contains("toString"))
                    ) { // we only handle objects that have overridden toString
                continue;
            }
            methodsStringBuilder
                    .append("{\"name\":\"")
                    .append(method.getName())
                    .append("\", \"value\":\"")
                    .append(methodValue)
                    .append("\"}");
            if (i < methods.size() - 1) {
                methodsStringBuilder.append(", ");
            }
        }
        methodsStringBuilder.append("]");
        return methodsStringBuilder.toString();
    }

}
