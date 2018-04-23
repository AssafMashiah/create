package com.t2k.cgs.utils.standards.validators;

import com.t2k.cgs.utils.standards.model.StandardNode;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 6:02 PM
 */
@Test
public class ValidatorsTest {

    @BeforeMethod
    private void initTests() {

    }


    @Test(expectedExceptions = InternalError.class)
    public void testUniqueIdValidatorFailWithoutInitialize() throws Exception {
        StandardsValidator validator = new UniquePedagogicalIdValidator();

        StandardNode root = mock(StandardNode.class);
        StandardNode child = mock(StandardNode.class);

        when(root.getPedagogicalId()).thenReturn("123");
        when(child.getPedagogicalId()).thenReturn("321");


        when(root.getChildren()).thenReturn(Arrays.asList(child));
        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());

        validator.validate(root,Arrays.asList(root,child));

    }

    @Test
    public void testUniqueIdValidatorWithError() throws Exception {
        StandardsValidator validator = new UniquePedagogicalIdValidator();

        StandardNode root = mock(StandardNode.class);
        StandardNode child = mock(StandardNode.class);

        when(root.getPedagogicalId()).thenReturn("123");
        when(child.getPedagogicalId()).thenReturn("123");


        when(root.getChildren()).thenReturn(Arrays.asList(child));
        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());

        validator.initialize();

        validator.validate(null, Arrays.asList(root,child));

        assertTrue(validator.hadErrors());
        assertNotNull(validator.getErrorMessages());
        assertEquals(validator.getErrorMessages().size(), 1);

        verify(root, atLeastOnce()).getPedagogicalId();
        verify(child, atLeastOnce()).getPedagogicalId();

    }

    @Test
    public void testUniqueIdValidatorWithoutError() throws Exception {
        StandardsValidator validator = new UniquePedagogicalIdValidator();

        StandardNode root = mock(StandardNode.class);
        StandardNode child = mock(StandardNode.class);

        when(root.getPedagogicalId()).thenReturn("123");
        when(child.getPedagogicalId()).thenReturn("234");


        when(root.getChildren()).thenReturn(Arrays.asList(child));
        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());

        validator.initialize();

        validator.validate(null, Arrays.asList(root,child));

        assertFalse(validator.hadErrors());
        assertNotNull(validator.getErrorMessages());
        assertEquals(validator.getErrorMessages().size(), 0);

        verify(root, atLeastOnce()).getPedagogicalId();
        verify(child, atLeastOnce()).getPedagogicalId();

    }

    @Test
    public void testUniqueIdValidatorWithErrorsAndInit() throws Exception {
        StandardsValidator validator = new UniquePedagogicalIdValidator();

        StandardNode root = mock(StandardNode.class);
        StandardNode child = mock(StandardNode.class);

        when(root.getPedagogicalId()).thenReturn("123");
        when(child.getPedagogicalId()).thenReturn("123");


        when(root.getChildren()).thenReturn(Arrays.asList(child));
        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());

        validator.initialize();

        validator.validate(null, Arrays.asList(root,child));

        assertTrue(validator.hadErrors());
        assertNotNull(validator.getErrorMessages());
        assertEquals(validator.getErrorMessages().size(), 1);

        when(child.getPedagogicalId()).thenReturn("321");

        validator.initialize();

        validator.validate(null, Arrays.asList(root,child));

        assertFalse(validator.hadErrors());
        assertNotNull(validator.getErrorMessages());
        assertEquals(validator.getErrorMessages().size(), 0);

    }

//    @Test(expectedExceptions = InternalError.class)
//    private void testDisplayIdValidatorFailsWithoutInit() throws Exception {
//        DisplayIdValidator validator = new DisplayIdValidator();
//
//        StandardNode root = mock(StandardNode.class);
//        StandardNode child = mock(StandardNode.class);
//
//        when(root.getDisplayId()).thenReturn("123");
//        when(child.getDisplayId()).thenReturn("123");
//
//        when(root.getChildren()).thenReturn(Arrays.asList(child));
//        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());
//
//        validator.validate(root,null);
//    }

//    @Test
//    private void testDisplayIdValidatorWithError1() throws Exception {
//        DisplayIdValidator validator = new DisplayIdValidator();
//
//        StandardNode root = mock(StandardNode.class);
//        StandardNode child = mock(StandardNode.class);
//
//        when(root.getDisplayId()).thenReturn("123");
//        when(child.getDisplayId()).thenReturn("123");
//
//        when(root.getChildren()).thenReturn(Arrays.asList(child));
//        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());
//
//        validator.initialize();
//
//        validator.validate(root,null);
//
//        assertTrue(validator.hadErrors());
//        assertNotNull(validator.getErrorMessages());
//        assertEquals(validator.getErrorMessages().size(), 1);
//
//        verify(root, atLeastOnce()).getDisplayId();
//        verify(child, atLeastOnce()).getDisplayId();
//        verify(root, atLeastOnce()).getChildren();
//        verify(child, atLeastOnce()).getChildren();
//    }
//
//    @Test
//    private void testDisplayIdValidatorWithError2() throws Exception {
//
//        DisplayIdValidator validator = new DisplayIdValidator();
//
//        StandardNode root = mock(StandardNode.class);
//        StandardNode child = mock(StandardNode.class);
//
//        when(root.getChildren()).thenReturn(Arrays.asList(child));
//        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());
//
//        validator.initialize();
//
//        validator.validate(root,null);
//
//        assertTrue(validator.hadErrors());
//        assertNotNull(validator.getErrorMessages());
//        assertEquals(validator.getErrorMessages().size(), 1);
//
//        verify(root, atLeastOnce()).getDisplayId();
//        verify(child, atLeastOnce()).getDisplayId();
//        verify(root, atLeastOnce()).getChildren();
//        verify(child, atLeastOnce()).getChildren();
//    }

//    @Test
//    private void testDisplayIdValidatorWithoutError() throws Exception {
//        DisplayIdValidator validator = new DisplayIdValidator();
//
//        StandardNode root = mock(StandardNode.class);
//        StandardNode child = mock(StandardNode.class);
//
//        when(child.getDisplayId()).thenReturn("4123");
//
//        when(root.getChildren()).thenReturn(Arrays.asList(child));
//        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());
//
//        validator.initialize();
//
//        validator.validate(root,null);
//
//        assertFalse(validator.hadErrors());
//        assertNotNull(validator.getErrorMessages());
//        assertEquals(validator.getErrorMessages().size(), 0);
//
//        verify(root, atLeastOnce()).getDisplayId();
//        verify(child, atLeastOnce()).getDisplayId();
//        verify(root, atLeastOnce()).getChildren();
//        verify(child, atLeastOnce()).getChildren();
//
//    }

//    @Test
//    private void testDisplayIdValidatorWithErrorsAndInit() throws Exception {
//
//        DisplayIdValidator validator = new DisplayIdValidator();
//
//        StandardNode root = mock(StandardNode.class);
//        StandardNode child = mock(StandardNode.class);
//
//        when(root.getChildren()).thenReturn(Arrays.asList(child));
//        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());
//
//        validator.initialize();
//
//        validator.validate(root,null);
//
//        assertTrue(validator.hadErrors());
//        assertNotNull(validator.getErrorMessages());
//        assertEquals(validator.getErrorMessages().size(), 1);
//
//
//        when(child.getDisplayId()).thenReturn("ljksfg");
//
//        validator.initialize();
//
//        validator.validate(root,null);
//
//        assertFalse(validator.hadErrors());
//        assertNotNull(validator.getErrorMessages());
//        assertEquals(validator.getErrorMessages().size(), 0);
//
//    }

    @Test(expectedExceptions = InternalError.class)
    public void testValidationSequenceFailWithoutInit() {
        ValidationSequence validator = new ValidationSequence();

        List<StandardsValidator> validators = new LinkedList<StandardsValidator>();

        StandardsValidator validator1 = mock(StandardsValidator.class);
        when(validator1.hadErrors()).thenReturn(false);
        when(validator1.getErrorMessages()).thenReturn(new ArrayList<String>());

        validators.add(validator1);

        validator.setValidatorList(validators);

        StandardNode root = mock(StandardNode.class);
        StandardNode child = mock(StandardNode.class);

        when(root.getChildren()).thenReturn(Arrays.asList(child));
        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());

        when(root.getPedagogicalId()).thenReturn("124");
        when(child.getPedagogicalId()).thenReturn("124");

        List<StandardNode> list = Arrays.asList(root,child);

        validator.validate(root,list);

        verify(validator1, never()).validate(eq(root),eq(list));
    }

    @Test
    public void testValidationSequenceWithErrors() throws Exception {

        ValidationSequence validator = new ValidationSequence();

        List<StandardsValidator> validators = new LinkedList<StandardsValidator>();

        StandardsValidator validator1 = mock(StandardsValidator.class);
        when(validator1.hadErrors()).thenReturn(false);
        when(validator1.getErrorMessages()).thenReturn(new ArrayList<String>());


        StandardsValidator validator2 = mock(StandardsValidator.class);
        when(validator1.hadErrors()).thenReturn(true);
        when(validator1.getErrorMessages()).thenReturn(Arrays.asList("msg1", "msg2"));

        StandardsValidator validator3 = mock(StandardsValidator.class);
        when(validator3.hadErrors()).thenReturn(true);
        when(validator3.getErrorMessages()).thenReturn(Arrays.asList("msg1", "msg2"));

        validators.add(validator1);
        validators.add(validator2);
        validators.add(validator3);

        validator.setValidatorList(validators);

        StandardNode root = mock(StandardNode.class);
        StandardNode child = mock(StandardNode.class);

        when(root.getChildren()).thenReturn(Arrays.asList(child));
        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());

        when(root.getPedagogicalId()).thenReturn("124");
        when(child.getPedagogicalId()).thenReturn("124");

        validator.initialize();

        List<StandardNode> list = Arrays.asList(root,child);

        validator.validate(root,list);

        assertTrue(validator.hadErrors());
        assertNotNull(validator.getErrorMessages());
        assertEquals(validator.getErrorMessages().size(), 4);

        verify(validator1, atLeastOnce()).initialize();
        verify(validator1, atLeastOnce()).getErrorMessages();
        verify(validator1, atLeastOnce()).hadErrors();
        verify(validator1, atLeastOnce()).validate(eq(root),eq(list));


        verify(validator2, atLeastOnce()).initialize();
        verify(validator2, atLeastOnce()).getErrorMessages();
        verify(validator2, atLeastOnce()).hadErrors();
        verify(validator2, atLeastOnce()).validate(eq(root),eq(list));

        verify(validator3, atLeastOnce()).initialize();
        verify(validator3, atLeastOnce()).getErrorMessages();
        verify(validator3, atLeastOnce()).hadErrors();
        verify(validator3, atLeastOnce()).validate(eq(root), eq(list));

    }

    @Test
    public void testValidationSequenceWithoutErrors() throws Exception {
        ValidationSequence validator = new ValidationSequence();

        List<StandardsValidator> validators = new LinkedList<StandardsValidator>();

        StandardsValidator validator1 = mock(StandardsValidator.class);
        when(validator1.hadErrors()).thenReturn(false);
        when(validator1.getErrorMessages()).thenReturn(new ArrayList<String>());


        StandardsValidator validator2 = mock(StandardsValidator.class);
        when(validator1.hadErrors()).thenReturn(false);
        when(validator1.getErrorMessages()).thenReturn(new ArrayList<String>());


        validators.add(validator1);
        validators.add(validator2);

        validator.setValidatorList(validators);

        StandardNode root = mock(StandardNode.class);
        StandardNode child = mock(StandardNode.class);

        when(root.getChildren()).thenReturn(Arrays.asList(child));
        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());

        when(root.getPedagogicalId()).thenReturn("124");
        when(child.getPedagogicalId()).thenReturn("124");

        validator.initialize();

        List<StandardNode> list = Arrays.asList(root,child);

        validator.validate(root,list);

        assertFalse(validator.hadErrors());
        assertNotNull(validator.getErrorMessages());
        assertEquals(validator.getErrorMessages().size(), 0);

        verify(validator1, atLeastOnce()).initialize();
        verify(validator1, atLeastOnce()).getErrorMessages();
        verify(validator1, atLeastOnce()).hadErrors();
        verify(validator1, atLeastOnce()).validate(eq(root),eq(list));


        verify(validator2, atLeastOnce()).initialize();
        verify(validator2, atLeastOnce()).getErrorMessages();
        verify(validator2, atLeastOnce()).hadErrors();
        verify(validator2, atLeastOnce()).validate(eq(root),eq(list));

    }

    @Test
    public void testValidationSequenceWithErrorsAndInit() throws Exception {
        ValidationSequence validator = new ValidationSequence();

        List<StandardsValidator> validators = new LinkedList<StandardsValidator>();

        StandardsValidator validator1 = mock(StandardsValidator.class);
        when(validator1.hadErrors()).thenReturn(false);
        when(validator1.getErrorMessages()).thenReturn(new ArrayList<String>());


        StandardsValidator validator2 = mock(StandardsValidator.class);
        when(validator1.hadErrors()).thenReturn(true);
        when(validator1.getErrorMessages()).thenReturn(Arrays.asList("msg1", "msg2"));


        validators.add(validator1);
        validators.add(validator2);

        validator.setValidatorList(validators);

        StandardNode root = mock(StandardNode.class);
        StandardNode child = mock(StandardNode.class);

        when(root.getChildren()).thenReturn(Arrays.asList(child));
        when(child.getChildren()).thenReturn(new ArrayList<StandardNode>());

        when(root.getPedagogicalId()).thenReturn("124");
        when(child.getPedagogicalId()).thenReturn("124");

        validator.initialize();

        List<StandardNode> list = Arrays.asList(root,child);

        validator.validate(root,list);

        assertTrue(validator.hadErrors());
        assertNotNull(validator.getErrorMessages());
        assertEquals(validator.getErrorMessages().size(), 2);


        when(validator1.hadErrors()).thenReturn(false);
        when(validator1.getErrorMessages()).thenReturn(new ArrayList<String>());

        validator.initialize();

        validator.validate(root,list);

        assertFalse(validator.hadErrors());
        assertNotNull(validator.getErrorMessages());
        assertEquals(validator.getErrorMessages().size(), 0);


    }

}
